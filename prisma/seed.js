const {PrismaClient} = require('@prisma/client')
const bcrypt = require("bcrypt");
const prisma = new PrismaClient()

const userData = [
    {
        name: 'Ali',
        email: 'alice@ali.co',
        password: bcrypt.hashSync('password', 5),
        todos: {
            create: [
                {
                    title: 'java',
                    content: 'learn java',
                },
            ],
        },
    },
    {
        name: 'cansu',
        email: 'cansu@cansu.io',
        password: bcrypt.hashSync('password', 5),
        todos: {
            create: [
                {
                    title: 'express',
                    content: 'learn express',
                    isDone: true
                },
            ],
        },
    },
]

async function main() {
    console.log(`Start seeding ...`)
    for (const u of userData) {
        const user = await prisma.users.create({
            data: u,
        })
        console.log(`Created user with id: ${user.id}`)
    }
    console.log(`Seeding finished.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
