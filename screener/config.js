var config = {
development: {
    // poolConfig: {
    //     connectionLimit : 100, //important
    //     host     : 'localhost',
    //     user     : 'sasidharan',
    //     password : 'pass@123',
    //     database : 'ulu8fbsvef0qz3iv',
    //     debug    :  false
    // },
    poolConfig: {
        connectionLimit : 100, //important
        host     : 'ehc1u4pmphj917qf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user     : 'm1xeyx0bttelkcw8',
        password : 'evlob12rbvq02z4g',
        database : 'ulu8fbsvef0qz3iv',
        debug    :  false
    }
},
production: {
    //url to be used in link generation
    url: 'http://my.site.com',
    //mongodb connection settings
    database: {
        host: '127.0.0.1',
        port: '27017',
        db:     'site'
    },
    //server details
    server: {
        host:   '127.0.0.1',
        port:   '3421'
    },
    poolConfig: {
        connectionLimit : 100, //important
        host     : 'ehc1u4pmphj917qf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user     : 'm1xeyx0bttelkcw8',
        password : 'evlob12rbvq02z4g',
        database : 'ulu8fbsvef0qz3iv',
        debug    :  false
    }
}
};
module.exports = config;