const { query } = require("express");
const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/* dataToUpdate is a json data object with key value pairs of the data 
that will be used to update in an sql query. jsToSql is a json object 
with keys corresponding to keys in dataToUpdate and values specifying 
what the sql query will have as the name of the column to be updated
*/
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
  /* For each key in dataToUpdate, if jsToSql has the same key, then the value corresponding to 
     that key in jsToSql will be added to setCols. Else the key from dataToUpdate will be added.
  */
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );


  // return values are for the column names in SET and values to add to the column in VALUES
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

// Takes queries object 
function sqlForGetAllCompanies(queries = {}) {
  const { minEmployees, maxEmployees, name } = queries
  // WHERE line of the sql query
  where = []
  // values [] for the sql query
  vals = []
  // base sql query to add to
  let db_query = `SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl" FROM companies`
  
  //if maxEmployees is less than minEmployees, error is thrown
  if (maxEmployees < minEmployees) {
    throw new BadRequestError('minEmployees must be less than maxEmployees')
  }


  //builds the sql query depending on the request query
  if (minEmployees !== undefined) {
    vals.push(minEmployees)
    where.push(`num_employees >= $${vals.length}`)
  }

  if (maxEmployees !== undefined) {
    vals.push(maxEmployees)
    where.push(`num_employees <= $${vals.length}`)
  }

  if (name !== undefined) {
    vals.push(`%${name}%`)
    where.push(`name ILIKE $${vals.length}`)
  }
  
  if (where.length > 0) {
    db_query += " WHERE " + where.join(" AND ")
  }

  
  db_query += ' ORDER BY name'
  return {db_query, vals}
}

function sqlForGetAllJobs(queries = {}) {
  const { minSalary, hasEquity, title } = queries

  where = []

  vals = []

  let db_query = `SELECT j.id, 
                         j.title,
                         j.salary,
                         j.equity,
                         j.company_handle AS "companyHandle",
                         c.name AS "companyName"
                         FROM jobs j
                         LEFT JOIN companies AS c ON c.handle = j.company_handle`
  

  if (minSalary !== undefined) {
    vals.push(minSalary)
    where.push(`salary >= $${vals.length}`)
  }

  if (hasEquity) {
    where.push(`equity > 0`)
  }

  if (title !== undefined) {
    vals.push(`%${title}%`)
    where.push(`title ILIKE $${vals.length}`)
  }

  if (where.length > 0) {
    db_query += " WHERE " + where.join(" AND ")
  }
  db_query += ` ORDER BY name `
  return {db_query, vals}  
}

module.exports = { sqlForPartialUpdate, sqlForGetAllCompanies, sqlForGetAllJobs };

