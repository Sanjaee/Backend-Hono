import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = new Hono()

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
})

// Create User
app.post('/users', zValidator('json', userSchema), async (c) => {
  const { name, email } = c.req.valid('json')
  const user = await prisma.user.create({
    data: { name, email },
  })
  return c.json(user, 201)
})

// Get All Users
app.get('/users', async (c) => {
  const users = await prisma.user.findMany()
  return c.json(users)
})

// Get User by ID
app.get('/users/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return c.json({ error: 'User not found' }, 404)
  return c.json(user)
})

// Update User
app.put('/users/:id', zValidator('json', userSchema), async (c) => {
  const id = parseInt(c.req.param('id'))
  const { name, email } = c.req.valid('json')
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { name, email },
    })
    return c.json(user)
  } catch (error) {
    return c.json({ error: 'User not found' }, 404)
  }
})

// Delete User
app.delete('/users/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  try {
    await prisma.user.delete({ where: { id } })
    return c.json({ message: 'User deleted successfully' })
  } catch (error) {
    return c.json({ error: 'User not found' }, 404)
  }
})

// Konfigurasi server untuk Vercel
const port = parseInt(process.env.PORT || '3000')

export default {
  port,
  fetch: app.fetch,
}
