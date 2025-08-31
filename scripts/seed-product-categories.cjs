/*
  Seed product categories (Level 1 and Level 2) into Firestore:
  - Collection: productCategories
  - Fields align with src/modules/procurement/types/category.ts

  Usage:
    node scripts/seed-product-categories.js

  Prereqs:
    - Ensure scripts/serviceAccountKey.json exists and has access to the target Firebase project
    - Firestore rules allow the Admin SDK
*/

const admin = require('firebase-admin')
const path = require('path')

// Load service account
const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
})

const db = admin.firestore()

// Utility to create code like L1-FUR-001 etc.
function makeCode(prefix, level, index) {
  const idx = String(index).padStart(3, '0')
  return `L${level}-${prefix}-${idx}`
}

async function main() {
  const now = admin.firestore.FieldValue.serverTimestamp()
  const collection = db.collection('productCategories')
  const createdBy = 'seed-script'

  // Define Level 1 and Level 2 hierarchies
  const hierarchies = [
    {
      name: 'Furniture',
      prefix: 'FUR',
      children: [
        'Armchair',
        'Two-Seater Sofa',
        'Three-Seater Sofa',
        'L-shape Sofa',
        'Coffee Table',
        'Side Table',
        'Console Table',
        'Dining Table',
        'Office Desk',
        'Dining Chair',
        'Office Chair',
        'Accent Chair',
        'Bench',
        'Bed',
        'Nightstand',
        'Dressing Table',
        'Drawer Chest',
        'Wardrobe',
        'Buffet / Sideboard',
        'Display Cabinet',
        'Bookcase / Shelf',
        'Partition',
      ],
    },
    {
      name: 'Lighting',
      prefix: 'LGT',
      children: [
        'Chandelier',
        'Pendant Light',
        'Ceiling Light',
        'Wall Light',
        'Table Lamp',
        'Floor Lamp',
        'Linear Light',
        'Double Height Light',
      ],
    },
    {
      name: 'Decor & Accessories',
      prefix: 'DEC',
      children: [
        'Mirror',
        'Clock',
        'Vase',
        'Cushion',
        'Sofa Runner / Throw',
        'Statue / Sculpture',
        'Painting',
        'Wall Art',
        'Rug',
        'Candle',
        'Candle Holder',
        'Decorative Tableware',
        'Decorative Box',
        'Bookend',
        'Book Box',
        'Home Perfume / Diffuser',
        'Artificial Flowers / Plants',
        'Globe',
        'Armillary Sphere',
        'Decorative Models',
        'Binocular',
        'Walking Stick / Cane',
        'Shoe Horn',
        'Fireplace Set',
        'Ashtray',
        'Bottle Holder',
        'Card Box',
        'Game Set',
        'Decorative Stand',
        'Hanger',
      ],
    },
  ]

  // Helper: find existing L1 by name
  async function findLevel1ByName(name) {
    const snap = await collection
      .where('level', '==', 1)
      .where('name', '==', name)
      .get()
    if (!snap.empty) {
      const doc = snap.docs[0]
      return { id: doc.id, data: doc.data() }
    }
    return null
  }

  // Helper: find existing L2 by parent and name
  async function findLevel2ByParentAndName(parentId, name) {
    const snap = await collection
      .where('level', '==', 2)
      .where('parentId', '==', parentId)
      .where('name', '==', name)
      .get()
    if (!snap.empty) return { id: snap.docs[0].id, data: snap.docs[0].data() }
    return null
  }

  // Helper: get next sortOrder under a given parent/level
  async function getNextSortOrder(level, parentId = null) {
    let q = collection.where('level', '==', level)
    if (level > 1) q = q.where('parentId', '==', parentId)
    const snap = await q.get()
    const count = snap.size
    return count + 1
  }

  // Ensure Level 1 categories exist or create them
  const roots = []
  for (let i = 0; i < hierarchies.length; i++) {
    const h = hierarchies[i]
    const existing = await findLevel1ByName(h.name)
    if (existing) {
      roots.push({ id: existing.id, ...h })
      console.log(`Found L1: ${h.name} (${existing.id})`)
    } else {
      const sortOrder = await getNextSortOrder(1, null)
      const rootDoc = await collection.add({
        name: h.name,
        code: makeCode(h.prefix, 1, sortOrder),
        description: '',
        level: 1,
        parentId: null,
        sortOrder,
        isActive: true,
        createdBy,
        createdAt: now,
        updatedAt: now,
      })
      roots.push({ id: rootDoc.id, ...h })
      console.log(`Created L1: ${h.name} (${rootDoc.id})`)
    }
  }

  // Ensure Level 2 subcategories under each root
  for (const root of roots) {
    for (let j = 0; j < root.children.length; j++) {
      const childName = root.children[j]
      const found = await findLevel2ByParentAndName(root.id, childName)
      if (found) {
        console.log(`  - Exists under ${root.name}: ${childName} (${found.id})`)
        continue
      }
      const sortOrder = await getNextSortOrder(2, root.id)
      const childCode = makeCode(root.prefix, 2, sortOrder)
      const docRef = await collection.add({
        name: childName,
        code: childCode,
        description: '',
        level: 2,
        parentId: root.id,
        sortOrder,
        isActive: true,
        createdBy,
        createdAt: now,
        updatedAt: now,
      })
      console.log(`  - Created under ${root.name}: ${childName} (${docRef.id})`)
    }
  }

  console.log('Seeding complete.')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
