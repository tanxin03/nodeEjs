const MongoClient = require('mongodb').MongoClient
// 数据库连接的地址，最后的斜杠表示数据库名字
const shujukuURL = 'mongodb://127.0.0.1:27017'
function _connect(callback){
    MongoClient.connect(shujukuURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db)=>{
        if(err){
            console.log("数据库连接失败")
            return
        }
        const mydb = db.db('onlineShop');
        callback(mydb, db)
    })
}

exports.find = (connectionname, json={}, callback)=>{
    _connect((mydb, db)=>{
        console.log(json)
        mydb.collection(connectionname).find(json).toArray((err, result)=>{
            callback(err, result)
            db.close()
        })
    })
}
exports.insert = (connectionname, json, callback)=>{
    _connect((mydb, db)=>{
        mydb.collection(connectionname).insertOne(json, function(err,result){
            callback(err, result)
            db.close()
        })
    })
}
exports.update = (connectionname, newJson, oldJson, callback)=>{
    console.log("11111")
    console.log(newJson)
    console.log(oldJson)
    _connect((mydb, db)=>{
        mydb.collection(connectionname).updateOne(newJson, {$set:oldJson}, function(err, data){
            callback(err, data)
            db.close()
        })
    })
}

exports.deleteOne = (connectionname, json, callback)=>{
    _connect((mydb ,db)=>{
        mydb.collection(connectionname).deleteOne(json, function(err, data){
            callback(err, data)
            db.close()
        })
    })
}
