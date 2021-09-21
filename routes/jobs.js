'use strict'

/** Routes for jobs.   */

const jsonschema = require('jsonschema')
const express = require('express')

const { BadRequestError } = require('../expressError')
const { ensureLoggedIn, ensureIsAdmin } = require('../middleware/auth')
const Job = require('../models/job')

const jobNewSchema = require("../schemas/jobNewSchema.json")
const Company = require('../models/company')
const jobUpdateSchema = require("../schemas/jobUpdateSchema.json")
const jobeGetAll = require("../schemas/jobGetAll.json")

const router = new express.Router()


router.post("/", ensureIsAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack)
            throw new BadRequestError(errs)
        }

        const job = await Job.create(req.body)
        return res.status(201).json({ job })
    } catch (err) {
        return next(err)
    }
})

router.get("/", async function (req, res, next) {
    try {
        // changes string values to numbers, string to boolean
        if (req.query.minSalary !== undefined) {
            req.query.minSalary = Number(req.query.minSalary)
        }
        if (req.query.hasEquity === "true") {
            req.query.hasEquity = true
        } else if (req.query.hasEquity === "false") {
            req.query.hasEquity = false
        }

        //checks json schema for correct json values in request query
        const validator = jsonschema.validate(req.query, jobeGetAll)
        
        if (validator.valid) {
            const jobs = await Job.findAll(req.query)
            return res.json({ jobs })
        } else {
            const errors = validator.errors.map(e => e.stack)
            throw new BadRequestError(errors)
        }
    } catch (err) {
        return next(err)
    }
})

router.get('/:id', async function (req, res, next) {
    try {
        const job = await Job.get(req.params.id)
        return res.json({ job })
    } catch (err) {
        return next(err)
    }
})

router.patch('/:id', ensureIsAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack)
            throw new BadRequestError(errs)
        }

        const job = await Job.update(req.params.id, req.body)
        return res.json({ job })
    } catch (err) {
        return next(err)
    }
})

router.delete('/:id', ensureIsAdmin, async function (req, res, next) {
    try {
        await Job.remove(req.params.id)
        return res.json({ deleted: Number(req.params.id) })
    } catch (err) {
        return next(err)
    }
})

module.exports = router