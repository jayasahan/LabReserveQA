const crypto = require('crypto')
const os = require('os')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const TEST_DATABASE_NAME = 'labreserve_concurrency_test'
const originalJwtSecret = process.env.JWT_SECRET
const testJwtSecret = crypto.randomBytes(32).toString('hex')
process.env.JWT_SECRET = testJwtSecret

require('dotenv').config()

const { app } = require('../server')
const { setTestClaimBarrier } = require('../controllers/requestController')
const User = require('../models/User')
const Equipment = require('../models/Equipment')
const Request = require('../models/Request')

let httpServer
let equipmentId
let assetCode
const studentIds = []

function getSafeTestMongoUri() {
  const uri = process.env.TEST_MONGODB_URI
  if (!uri) {
    throw new Error('TEST_MONGODB_URI is required; this test never falls back to MONGODB_URI.')
  }

  let parsedUri
  try {
    parsedUri = new URL(uri)
  } catch {
    throw new Error('TEST_MONGODB_URI must be a valid local MongoDB URI for the approved test database.')
  }

  const allowedHosts = new Set(['localhost', '127.0.0.1', '[::1]'])
  const databaseName = decodeURIComponent(parsedUri.pathname.replace(/^\//, ''))
  if (
    parsedUri.protocol !== 'mongodb:' ||
    !allowedHosts.has(parsedUri.hostname) ||
    databaseName !== TEST_DATABASE_NAME ||
    parsedUri.username ||
    parsedUri.password ||
    parsedUri.search ||
    parsedUri.hash
  ) {
    throw new Error(
      `TEST_MONGODB_URI must use localhost and the dedicated ${TEST_DATABASE_NAME} database, without credentials or URI options.`
    )
  }

  const configuredApplicationUri = process.env.MONGODB_URI
  if (configuredApplicationUri) {
    try {
      const applicationDatabaseName = decodeURIComponent(new URL(configuredApplicationUri).pathname.replace(/^\//, ''))
      if (applicationDatabaseName === TEST_DATABASE_NAME) {
        throw new Error('TEST_MONGODB_URI must not use the database configured by MONGODB_URI.')
      }
    } catch (error) {
      if (error.message.startsWith('TEST_MONGODB_URI')) throw error
      // An unrelated or malformed application URI is never used by this test.
    }
  }

  return uri
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
}

function createClaimBarrier(expectedArrivals, timeoutMs) {
  let arrivals = 0
  let released = false
  let rejectRelease
  let resolveRelease
  const release = new Promise((resolve, reject) => {
    resolveRelease = resolve
    rejectRelease = reject
  })
  const timeout = setTimeout(() => {
    rejectRelease(new Error(`Equipment claim barrier timed out after ${arrivals}/${expectedArrivals} arrivals.`))
  }, timeoutMs)

  return {
    async wait() {
      arrivals += 1
      if (arrivals === expectedArrivals) {
        released = true
        clearTimeout(timeout)
        resolveRelease()
      }
      await release
    },
    arrivals() {
      return arrivals
    },
    released() {
      return released
    }
  }
}

describe('equipment request concurrency integration', () => {
  beforeAll(async () => {
    const testMongoUri = getSafeTestMongoUri()
    await mongoose.connect(testMongoUri, {
      serverSelectionTimeoutMS: 5000,
      runtimeAdapters: { os }
    })

    if (mongoose.connection.name !== TEST_DATABASE_NAME) {
      await mongoose.disconnect()
      throw new Error('MongoDB connected to a database other than the approved concurrency test database.')
    }

    const runId = crypto.randomUUID().replace(/-/g, '')
    assetCode = `QA-CONCURRENCY-${runId}`.toUpperCase()

    const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10)
    for (const index of [1, 2]) {
      const email = `qa-concurrency-${runId}-${index}@example.test`
      const student = await User.create({
        name: `Concurrency Student ${index}`,
        email,
        password: passwordHash,
        role: 'STUDENT'
      })
      studentIds.push(student._id)
    }

    const equipment = await Equipment.create({
      name: 'Disposable Concurrency Test Equipment',
      category: 'QA Test',
      assetCode,
      description: 'Fixture created and removed by the request concurrency integration test.',
      status: 'AVAILABLE'
    })
    equipmentId = equipment._id

    await new Promise((resolve, reject) => {
      httpServer = app.listen(0, '127.0.0.1', resolve)
      httpServer.once('error', reject)
    })
  })

  afterAll(async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        if (equipmentId) {
          await Request.deleteMany({ equipment: equipmentId })
          await Equipment.deleteOne({ _id: equipmentId, assetCode })
        }
        if (studentIds.length) {
          await User.deleteMany({ _id: { $in: studentIds }, role: 'STUDENT' })
        }
      }
    } finally {
      try {
        if (httpServer?.listening) await close(httpServer)
      } finally {
        if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
        if (originalJwtSecret === undefined) {
          delete process.env.JWT_SECRET
        } else {
          process.env.JWT_SECRET = originalJwtSecret
        }
      }
    }
  })

  test('allows exactly one of two students to claim the same available equipment', async () => {
    const address = httpServer.address()
    const endpoint = `http://127.0.0.1:${address.port}/api/requests`
    const tokens = studentIds.map((studentId) => jwt.sign(
      { userId: studentId.toString() },
      testJwtSecret,
      { expiresIn: '5m' }
    ))

    const claimBarrier = createClaimBarrier(2, 5000)
    setTestClaimBarrier(claimBarrier.wait)
    let responses
    try {
      responses = await Promise.all(tokens.map((token) => fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ equipmentId: equipmentId.toString(), loanDays: 5 })
      })))
    } finally {
      setTestClaimBarrier(null)
    }

    expect(claimBarrier.arrivals()).toBe(2)
    expect(claimBarrier.released()).toBe(true)
    const responseBodies = await Promise.all(responses.map((response) => response.json()))
    const statuses = responses.map((response) => response.status)
    expect([...statuses].sort((left, right) => left - right)).toEqual([201, 409])

    const winnerIndex = statuses.indexOf(201)
    const loserIndex = statuses.indexOf(409)
    expect(responseBodies[loserIndex]).toEqual({ message: 'Equipment is no longer available.' })
    expect(responseBodies[winnerIndex].request.status).toBe('PENDING')
    expect(responseBodies[winnerIndex].request.equipment.status).toBe('REQUESTED')

    const allRequests = await Request.find({ equipment: equipmentId })
    const storedEquipment = await Equipment.findById(equipmentId)

    expect(allRequests).toHaveLength(1)
    expect(allRequests[0].status).toBe('PENDING')
    expect(studentIds.map((studentId) => studentId.toString())).toContain(allRequests[0].student.toString())
    expect(allRequests[0].student.toString()).toBe(studentIds[winnerIndex].toString())
    expect(storedEquipment.status).toBe('REQUESTED')
  })
})
