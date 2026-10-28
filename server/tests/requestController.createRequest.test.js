const mongoose = require('mongoose')

jest.mock('../models/Equipment', () => ({
  findOneAndUpdate: jest.fn(),
  exists: jest.fn(),
  updateOne: jest.fn()
}))

jest.mock('../models/Request', () => ({
  create: jest.fn(),
  findById: jest.fn()
}))

const Equipment = require('../models/Equipment')
const Request = require('../models/Request')
const { createRequest } = require('../controllers/requestController')

const equipmentId = new mongoose.Types.ObjectId().toString()
const studentId = new mongoose.Types.ObjectId().toString()
const requestId = new mongoose.Types.ObjectId().toString()

function makeRequest(body = { equipmentId }) {
  return {
    user: { _id: studentId, role: 'STUDENT' },
    body
  }
}

function makeResponse() {
  const response = {
    status: jest.fn(),
    json: jest.fn()
  }
  response.status.mockReturnValue(response)
  response.json.mockReturnValue(response)
  return response
}

function mockSuccessfulRequest(populatedRequest = { _id: requestId }) {
  Equipment.findOneAndUpdate.mockResolvedValue({
    _id: equipmentId,
    status: 'REQUESTED'
  })
  Request.create.mockResolvedValue({ _id: requestId })
  Request.findById.mockReturnValue({
    populate: jest.fn().mockResolvedValue(populatedRequest)
  })
}

beforeEach(() => {
  jest.resetAllMocks()
  Equipment.updateOne.mockResolvedValue({ acknowledged: true })
})

describe('createRequest()', () => {
  test('P1/WB-01 creates a request with valid loan days', async () => {
    const req = makeRequest({ equipmentId, loanDays: 5 })
    const res = makeResponse()
    const populatedRequest = { _id: requestId, loanDays: 5 }
    mockSuccessfulRequest(populatedRequest)

    await createRequest(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ request: populatedRequest })
    expect(Equipment.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: equipmentId, status: 'AVAILABLE' },
      { $set: { status: 'REQUESTED' } },
      { new: true }
    )
    expect(Request.create).toHaveBeenCalledWith({
      student: studentId,
      equipment: equipmentId,
      status: 'PENDING',
      loanDays: 5
    })
    expect(Equipment.updateOne).not.toHaveBeenCalled()
  })

  test('P2/WB-02 rejects non-student authorization', async () => {
    const req = makeRequest()
    req.user.role = 'ADMIN'
    const res = makeResponse()

    await createRequest(req, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ message: 'Student access required' })
    expect(Equipment.findOneAndUpdate).not.toHaveBeenCalled()
    expect(Request.create).not.toHaveBeenCalled()
  })

  test.each([
    ['missing equipment ID', {}],
    ['invalid equipment ID', { equipmentId: 'not-an-object-id' }]
  ])('P3/WB-03 rejects %s before model calls', async (_label, body) => {
    const req = makeRequest(body)
    const res = makeResponse()

    await createRequest(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'A valid equipment ID is required' })
    expect(Equipment.findOneAndUpdate).not.toHaveBeenCalled()
    expect(Request.create).not.toHaveBeenCalled()
  })

  test('WB-03a short-circuits before loan-days validation when equipment ID is missing', async () => {
    const req = makeRequest({ loanDays: 0 })
    const res = makeResponse()

    await createRequest(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'A valid equipment ID is required' })
    expect(Equipment.findOneAndUpdate).not.toHaveBeenCalled()
  })

  test('P4/WB-04 uses seven days when loanDays is omitted', async () => {
    const req = makeRequest({ equipmentId })
    const res = makeResponse()
    mockSuccessfulRequest()

    await createRequest(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(Request.create).toHaveBeenCalledWith({
      student: studentId,
      equipment: equipmentId,
      status: 'PENDING',
      loanDays: 7
    })
  })

  test.each([
    ['non-integer', '7'],
    ['below minimum', 0],
    ['above maximum', 15]
  ])('P5/WB-05 rejects loanDays that are %s', async (_label, loanDays) => {
    const req = makeRequest({ equipmentId, loanDays })
    const res = makeResponse()

    await createRequest(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Loan days must be a whole number from 1 to 14'
    })
    expect(Equipment.findOneAndUpdate).not.toHaveBeenCalled()
    expect(Request.create).not.toHaveBeenCalled()
  })

  test('P6/WB-06 returns 404 when equipment does not exist', async () => {
    const req = makeRequest()
    const res = makeResponse()
    Equipment.findOneAndUpdate.mockResolvedValue(null)
    Equipment.exists.mockResolvedValue(false)

    await createRequest(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ message: 'Equipment not found' })
    expect(Equipment.exists).toHaveBeenCalledWith({ _id: equipmentId })
    expect(Request.create).not.toHaveBeenCalled()
    expect(Equipment.updateOne).not.toHaveBeenCalled()
  })

  test('P7/WB-07 returns 409 when equipment is unavailable', async () => {
    const req = makeRequest()
    const res = makeResponse()
    Equipment.findOneAndUpdate.mockResolvedValue(null)
    Equipment.exists.mockResolvedValue(true)

    await createRequest(req, res)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({ message: 'Equipment is no longer available.' })
    expect(Request.create).not.toHaveBeenCalled()
    expect(Equipment.updateOne).not.toHaveBeenCalled()
  })

  test('P8/WB-08 rolls equipment back after a Mongoose validation error', async () => {
    const req = makeRequest({ equipmentId, loanDays: 5 })
    const res = makeResponse()
    const validationError = new Error('Request validation failed')
    validationError.name = 'ValidationError'
    Equipment.findOneAndUpdate.mockResolvedValue({ _id: equipmentId, status: 'REQUESTED' })
    Request.create.mockRejectedValue(validationError)

    await createRequest(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Unable to create a valid request' })
    expect(Equipment.updateOne).toHaveBeenCalledWith(
      { _id: equipmentId, status: 'REQUESTED' },
      { $set: { status: 'AVAILABLE' } }
    )
  })

  test('P9/WB-09 rolls equipment back after an unexpected request error', async () => {
    const req = makeRequest({ equipmentId, loanDays: 5 })
    const res = makeResponse()
    Equipment.findOneAndUpdate.mockResolvedValue({ _id: equipmentId, status: 'REQUESTED' })
    Request.create.mockRejectedValue(new Error('database failure'))

    await createRequest(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ message: 'Unable to create request' })
    expect(Equipment.updateOne).toHaveBeenCalledWith(
      { _id: equipmentId, status: 'REQUESTED' },
      { $set: { status: 'AVAILABLE' } }
    )
  })

  test('WB-08a rolls equipment back when request population fails', async () => {
    const req = makeRequest()
    const res = makeResponse()
    Equipment.findOneAndUpdate.mockResolvedValue({ _id: equipmentId, status: 'REQUESTED' })
    Request.create.mockResolvedValue({ _id: requestId })
    Request.findById.mockReturnValue({
      populate: jest.fn().mockRejectedValue(new Error('population failure'))
    })

    await createRequest(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(Equipment.updateOne).toHaveBeenCalledWith(
      { _id: equipmentId, status: 'REQUESTED' },
      { $set: { status: 'AVAILABLE' } }
    )
  })
})
