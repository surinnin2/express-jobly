"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const { createToken } = require("../helpers/tokens");
const Job = require("../models/job.js");

let testJobIds = []

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");

  await Company.create(
      {
        handle: "c1",
        name: "C1",
        numEmployees: 1,
        description: "Desc1",
        logoUrl: "http://c1.img",
      });
  await Company.create(
      {
        handle: "c2",
        name: "C2",
        numEmployees: 2,
        description: "Desc2",
        logoUrl: "http://c2.img",
      });
  await Company.create(
      {
        handle: "c3",
        name: "C3",
        numEmployees: 3,
        description: "Desc3",
        logoUrl: "http://c3.img",
      });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });

  let j1 = await Job.create({
    title: "JOB1",
    salary: 1,
    equity: "0.1",
    companyHandle: "c1"
  })
  testJobIds[0] = j1.id

  let j2 = await Job.create({
    title: "JOB2",
    salary: 2,
    equity: "0.2",
    companyHandle: "c2"
  })
  testJobIds[1] = j2.id

  let j3 = await Job.create({
    title: "JOB3",
    salary: 3,
    equity: "0.3",
    companyHandle: "c3"
  })
  testJobIds[2] = j3.id
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const u1Token = createToken({ username: "u1", isAdmin: false });

//otherUserToken for routes needing specific user for access
const otherUserToken = createToken({ username: "other", isAdmin:false })

//adminToken for routes needing admin for access
const adminToken = createToken({ username: "admin", isAdmin: true })


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  otherUserToken,
  testJobIds
};
