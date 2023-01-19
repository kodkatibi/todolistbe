const express = require('express')
const bcrypt = require("bcrypt");
const {PrismaClient, Prisma} = require('@prisma/client')
const {body, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken')
const client = new PrismaClient()
const app = express()

app.use(express.json())

app.get('/', async (req, res) => {
    res.send('Hi')
})
app.post(`/register`, async (req, res, next) => {
    try {
        let {name, password, email} = req.body
        password = bcrypt.hashSync(password, 5)

        const result = await client.users.create({
            data: {
                name, email, password
            },
        })
        let token;
        try {
            token = jwt.sign({userId: result.id, email: result.email}, 'secretkeyappearshere', {expiresIn: "1h"})
        } catch (e) {
            console.log(err);
            const error = new Error("Error! Something went wrong.");
            return next(error);
        }

        res.json({
            success: true,
            data: {
                userId: result.id,
                email: result.email,
                name: result.name,
                token: token,
            },
        })
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // The .code property can be accessed in a type-safe manner
            if (e.code === 'P2002') {
                console.log(
                    'There is a unique constraint violation, a new user cannot be created with this email'
                )
            }
        }
        throw e
    }
})

app.post('/login', async (req, res, next) => {
    let {email, password} = req.body;

    let existingUser;
    try {
        existingUser = await client.users.findFirst({where: {email: email}});
    } catch {
        const error = new Error("Error! Something went wrong.");
        return next(error);
    }


    let hash = false
    await bcrypt.compare(password, existingUser.password)
        .then(result => {
            console.log(result)
            hash = result;
        })
        .catch(err => {
            console.log(err)
        })

    if (!existingUser || !hash) {
        const error = Error("Wrong details please check at once");
        return next(error);
    }
    let token;
    try {
        //Creating jwt token
        token = jwt.sign(
            {userId: existingUser.id, email: existingUser.email},
            "secretkeyappearshere",
            {expiresIn: "1h"}
        );
    } catch (err) {
        console.log(err);
        const error = new Error("Error! Something went wrong.");
        return next(error);
    }

    res.status(200).json({
        success: true,
        data: {
            userId: existingUser.id,
            email: existingUser.email,
            token: token,
        },
    });
})


const server = app.listen(3000, () => console.log(`
🚀 Server ready at: http://localhost:3000`),)
