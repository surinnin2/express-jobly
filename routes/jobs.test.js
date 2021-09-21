'use strict'

const request = require('supertest')

const db = require('../db')
const app = require('../app')

//import from _testCommon before and after funcitons
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    adminToken,
    testJobIds
} = require('./_testCommon')

//init before and after funcitons
beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

// POST method tests
describe('POST /jobs', function () {
    const newJob = {
        title: "newJOB",
        salary: 10,
        equity: "0.1",
        companyHandle: "c1"
    }
    
    test('ok for admins', async function () {
        const resp = await request(app)
            .post('/jobs')
            .send(newJob)
            .set('authorization', `Bearer ${adminToken}`)
        expect(resp.statusCode).toEqual(201)

        let jobID =  

        expect(resp.body).toEqual({
            job: {...newJob, id: expect.any(Number)}
        })
    })

    test('no access for users', async function () {
        const resp = await request(app)
            .post('/jobs')
            .send(newJob)
            .set('authorization', `Bearer ${u1Token}`)
        expect(resp.statusCode).toEqual(401)
    })

    test('bad request with missing data', async function () {
        const resp = await request(app)
            .post('/jobs')
            .send({
                equity: "0.1"
            })
            .set('authorization', `Bearer ${adminToken}`)
        expect(resp.statusCode).toEqual(400)
    })
    
})

//GET methods tests
describe('GET /jobs', function () {
    test('ok for anon', async function () {
        const resp = await request(app).get('/jobs')
        expect(resp.body).toEqual({
            jobs: [
                {   
                    id: testJobIds[0],
                    title: "JOB1",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1",
                    companyName: "C1"
                },
                {
                    id: testJobIds[1],
                    title: "JOB2",
                    salary: 2,
                    equity: "0.2",
                    companyHandle: "c2",
                    companyName: "C2"
                },
                {
                    id: testJobIds[2],
                    title: "JOB3",
                    salary: 3,
                    equity: "0.3",
                    companyHandle: "c3",
                    companyName: "C3"
                }
            ]
        })
    })
    
    test('works with queries', async function () {
        const resp = await request(app)
            .get('/jobs')
            .query({ minSalary: 3, hasEquity: true,  title: "JOB3"})
        expect(resp.body).toEqual({
            jobs: [
                {
                    id: testJobIds[2],
                    title: "JOB3",
                    salary: 3,
                    equity: "0.3",
                    companyHandle: "c3",
                    companyName: "C3"
                }
            ]
        })

    })

})

//GET /:id method tests
describe('GET /jobs/:id', function () {
    test('works for anon', async function () {
        const resp = await request(app).get(`/jobs/${testJobIds[0]}`)
        expect(resp.body).toEqual({
            job: {
                id: testJobIds[0],
                title: "JOB1",
                salary: 1,
                equity: "0.1",
                company: {
                    handle: "c1",
                    name: "C1",
                    description: "Desc1",
                    numEmployees: 1,
                    logoUrl: "http://c1.img",
                }
            } 
        })
    })

    test('not found for no such job', async function () {
        const resp = await request(app).get('/job/0')
        expect(resp.statusCode).toEqual(404)
    })
})

//PATCH /:id method tests
describe('PATCH /jobs/:id', function () {
    test('works for admin', async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                title: "JOB1-new"
            })
            .set('authorization', `Bearer ${adminToken}`)
        expect(resp.body).toEqual({
            job: {
                id: testJobIds[0],
                title: "JOB1-new",
                salary: 1,
                equity: "0.1",
                companyHandle: "c1"
            }
        })
    })

    test('unauth for anon', async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                title: "JOB-new"
            })
        expect(resp.statusCode).toEqual(401)
    })

    test('unauth for normal user', async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                title: "JOB-new"
            })
            .set('authorization', `Bearer ${u1Token}`)
        expect(resp.statusCode).toEqual(401)
    })
})

//DELETE /: id method tests

describe ('DELETE /jobs/:id', function () {
    test('works for admin', async function () {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`)
            .set('authorization', `Bearer ${adminToken}`)
        expect(resp.body).toEqual({ deleted: testJobIds[0] })
    })

    test('unauth for anon', async function () {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`)
        expect(resp.statusCode).toEqual(401)
    })

    test('unauth for normal user', async function () {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`)
            .set('authorization', `Bearer ${u1Token}`)
        expect(resp.statusCode).toEqual(401)
    })

    test('not found for job id', async function () {
        const resp = await request(app)
            .delete(`/jobs/0`)
            .set('authorization', `Bearer ${adminToken}`)
        expect(resp.statusCode).toEqual(404)
    })
})