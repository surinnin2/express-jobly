"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate, sqlForGetAllJobs } = require("../helpers/sql")

class Job {

    static async create({title, salary, equity, companyHandle}) {
        
        const result = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
            [title, salary, equity, companyHandle])
        const job = result.rows[0]

        return job
    }

    static async findAll(queries = {}) {
        const { db_query, vals } = sqlForGetAllJobs(queries)

        const jobsRes = await db.query(db_query, vals)
        return jobsRes.rows
    }

    static async get(id) {
        const jobRes = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`,
            [id])
        
        const job = jobRes.rows[0]

        if (!job) throw new NotFoundError(`No job with id: ${id}`)

        const companyRes = await db.query(
            `SELECT handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"
            FROM companies
            WHERE handle = $1`,
            [job.companyHandle])
        
        delete job.companyHandle
        job.company = companyRes.rows[0]

        return job
    }
    
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {})
        const idVarIdx = "$" + (values.length + 1)

        const querySql = `UPDATE jobs
                          SET ${setCols}
                          WHERE id = ${idVarIdx}
                          RETURNING id,
                                    title,
                                    salary,
                                    equity,
                                    company_handle AS "companyHandle"`
        const result = await db.query(querySql, [...values, id])
        const job = result.rows[0]

        if (!job) throw new NotFoundError(`No job with id: ${id}`)

        return job
    }

    static async remove(id) {
        const result = await db.query(
            `DELETE
             FROM jobs
             WHERE id = $1
             RETURNING id`,
             [id])
        const job = result.rows[0]

        if (!job) throw new NotFoundError(`No job with id: ${id}`)
    }    
}

module.exports = Job