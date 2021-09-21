'use strict'

const db = require('../db.js')
const { NotFoundError } = require('../expressError')
const Job = require('./job.js')
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds
} = require('./_testCommon')

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/********************** create */

describe("create", function () {
    const newJob = {
        title: "new",
        salary: 1,
        equity: "0.1",
        companyHandle: "c1"
    }
    console.log(newJob)

    test('works', async function () {
        let job = await Job.create(newJob)
        expect(job).toEqual({...newJob, id: expect.any(Number)})
    })
})

describe('findAll', function () {
    test('works: no filter', async function () {
        let jobs = await Job.findAll()
        expect(jobs).toEqual([
            {
                id: testJobIds[0],
                title: 'JOB1',
                salary: 1,
                equity: '0.1',
                companyHandle: 'c1',
                companyName: 'C1'
            },
            {
                id: testJobIds[1],
                title: 'JOB2',
                salary: 2,
                equity: '0.2',
                companyHandle: 'c2',
                companyName: 'C2'
            },
            {
                id: testJobIds[2],
                title: 'JOB3',
                salary: 3,
                equity: '0.3',
                companyHandle: 'c3',
                companyName: 'C3'
            }
        ])
    })
})

describe('get', function () {
    test('works', async function () {
        let job = await Job.get(testJobIds[0])
        expect(job).toEqual({
            id: testJobIds[0],
            title: 'JOB1',
            salary: 1,
            equity: '0.1',
            company: {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
            }
        })
    })
    test('not found if no such job', async function () {
        try {
            await Job.get(0)
            fail()
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy()
        }
    })
})

describe('update', function () {
    const updateData = {
        title: 'New',
        salary: 10,
        equity: '0.1',
    }
    test('works', async function () {
        let job = await Job.update(testJobIds[0], updateData)
        expect(job).toEqual({
            id: testJobIds[0],
            companyHandle: 'c1',
            ...updateData
        })
    })
    test('not found if no such job', async function () {
        try {
            await Job.update(0, updateData)
            fail()
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy()
        }
    })
})

describe('remove', function () {
    test('works', async function () {
        await Job.remove(testJobIds[0])
        const res = await db.query(
            `SELECT id FROM jobs WHERE id=${testJobIds[0]}`
        )
        expect(res.rows.length).toEqual(0)
    })
    test('not found if no such job', async function () {
        try {
            await Job.remove(0)
            fail()
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy()
        }
    })
})
    
