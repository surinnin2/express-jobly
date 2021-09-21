"use strict";

const { sqlForPartialUpdate } = require('../helpers/sql')

describe('sqlForPatialUpdate returns correct values', function() {
    test('test jsToSql with matching keys', function() {
        const testDataToUpdate = {attr1: 'attr1val', attr2: 'attr2val'}
        const testJsToSql =  {attr1: 'newAttr_1', attr2: 'attr_2'}
        let result = sqlForPartialUpdate(testDataToUpdate, testJsToSql)
        expect(result).toHaveProperty('setCols', '"newAttr_1"=$1, "attr_2"=$2')
        expect(result).toHaveProperty('values', ['attr1val', 'attr2val'])
    })
    test('test jsToSql with 1 unique key', function() {
        const testDataToUpdate2 = {attr1: 'attr1val', attr2: 'attr2val'}
        const testJsToSql2 = {uniqueKey: 'newAttr_1', attr2: 'attr_2'}
        let result = sqlForPartialUpdate(testDataToUpdate2, testJsToSql2)
        expect(result).toHaveProperty('setCols', '"attr1"=$1, "attr_2"=$2')
        expect(result).toHaveProperty('values', ['attr1val', 'attr2val'])
    })
})