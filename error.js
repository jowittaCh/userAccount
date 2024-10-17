module.exports={

    userExists:
    {
        message :"user is already signed Up" ,
        statusCode: 400
    },
    signUpError: {
        message: 'An error occured during the sign up process',
        statusCode: 401
    },
    userNoExists:
    {
        message :"incorrect email or password" ,
        statusCode: 402
    },
    
    invalid:
    {
        message :"invalid token" ,
        statusCode: 403
    },

    noMatch:
    {
        message :"unmatched passwords" ,
        statusCode: 404
    },

    incorrectPass:
    {
        message :"incorrect password" ,
        statusCode: 405
    },
}