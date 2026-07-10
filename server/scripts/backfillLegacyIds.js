import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import Product from '../models/Product.js'

// Safe to run any time, including on a DB that's already fully backfilled
// (it'll just find nothing to do). Needed once when upgrading a store that
// had admin-created products before legacyId auto-assignment existed.
async function run() {
  await connectDB()

  const highest = await Product.findOne().sort({ legacyId: -1 }).select('legacyId')
  let next = (highest?.legacyId || 0) + 1

  const orphans = await Product.find({ legacyId: null })
  for (const product of orphans) {
    product.legacyId = next++
    await product.save()
    console.log(`Assigned legacyId ${product.legacyId} to "${product.name}"`)
  }

  console.log(orphans.length ? `Backfilled ${orphans.length} product(s).` : 'Nothing to backfill — every product already has a legacyId.')
  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
