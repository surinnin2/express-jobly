const {sqlForPartialUpdate} = require('./sql')

describe('sqlForPartialUpdate Test', function () {
    test('works', function () {
        let dataToUpdate = {
            key1: "value1",
            key2: "value2"
        }
        let jsToSql = {
            key1: "label1forSQL",
            key2: "label2forSQL"
        }
        expect(sqlForPartialUpdate(dataToUpdate, jsToSql)).toEqual(
            {
                setCols: '"label1forSQL"=$1, "label2forSQL"=$2',
                values: ['value1', 'value2']

            }
        )
    })

    test('works with no jsToSql specified', function () {
        let dataToUpdate = {
            key1: "value1",
            key2: "value2"
        }
        expect(sqlForPartialUpdate(dataToUpdate)).toEqual(
            {
                setCols: '"key1"=$1, "key2"=$2',
                values: ['value1', 'value2']

            }
        )
    })

})