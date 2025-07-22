import { NextRequest, NextResponse } from "next/server"

// Mock online store data - in a real app, this would integrate with actual shopping APIs
const mockStoreItems = {
  dresses: [
    {
      name: "Elegant Black Midi Dress",
      price: "$89.99",
      store: "Nordstrom",
      url: "https://www.nordstrom.com/browse/women/clothing/dresses?filterByKeyword=black%20midi%20dress",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop&crop=center",
      description: "Classic black midi dress perfect for any occasion"
    },
    {
      name: "Floral Summer Dress",
      price: "$65.99", 
      store: "Zara",
      url: "https://www.zara.com/us/en/search?searchTerm=floral%20dress",
      image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=600&fit=crop&crop=center",
      description: "Light and breezy floral dress for summer"
    },
    {
      name: "Professional Sheath Dress",
      price: "$129.99",
      store: "Ann Taylor",
      url: "https://www.anntaylor.com/search/searchResults.jsp?Ntt=sheath%20dress",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=600&fit=crop&crop=center",
      description: "Perfect for business meetings and professional events"
    }
  ],
  tops: [
    {
      name: "Classic White Button-Down",
      price: "$49.99",
      store: "J.Crew",
      url: "https://www.jcrew.com/search2/index.jsp?N=0&Nloc=&Ntrm=white%20button%20down%20shirt&Npge=1&Nrpp=60",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop&crop=center",
      description: "Timeless white shirt that goes with everything"
    },
    {
      name: "Cashmere Sweater",
      price: "$89.99",
      store: "Everlane",
      url: "https://www.everlane.com/collections/womens-sweaters",
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop&crop=center",
      description: "Soft cashmere sweater in multiple colors"
    },
    {
      name: "Silk Blouse",
      price: "$79.99",
      store: "Banana Republic",
      url: "https://bananarepublic.gap.com/browse/search.do?searchText=silk%20blouse",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=600&fit=crop&crop=center",
      description: "Elegant silk blouse for work or evening"
    }
  ],
  bottoms: [
    {
      name: "High-Waisted Jeans",
      price: "$79.99",
      store: "Levi's",
      url: "https://www.levi.com/US/en_US/search?q=high%20waisted%20jeans%20women",
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=600&fit=crop&crop=center",
      description: "Classic high-waisted denim jeans"
    },
    {
      name: "Tailored Trousers",
      price: "$99.99",
      store: "COS",
      url: "https://www.cosstores.com/en_usd/search.html?q=tailored%20trousers%20women",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop&crop=center",
      description: "Professional tailored trousers"
    },
    {
      name: "Pleated Midi Skirt",
      price: "$69.99",
      store: "& Other Stories",
      url: "https://www.stories.com/en_usd/search.html?q=pleated%20midi%20skirt",
      image: "https://images.unsplash.com/photo-1583496661160-fb5886a13d77?w=400&h=600&fit=crop&crop=center",
      description: "Versatile pleated midi skirt"
    }
  ],
  shoes: [
    {
      name: "Leather Ankle Boots",
      price: "$159.99",
      store: "Cole Haan",
      url: "https://www.colehaan.com/search?q=women%20ankle%20boots%20leather",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=600&fit=crop&crop=center",
      description: "Comfortable leather ankle boots"
    },
    {
      name: "Classic Pumps",
      price: "$129.99",
      store: "Nine West",
      url: "https://www.ninewest.com/search?q=women%20pumps%20heels",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=600&fit=crop&crop=center",
      description: "Timeless pumps for professional wear"
    },
    {
      name: "White Sneakers",
      price: "$89.99",
      store: "Adidas",
      url: "https://www.adidas.com/us/search?q=women%20white%20sneakers",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=600&fit=crop&crop=center",
      description: "Clean white sneakers for casual wear"
    }
  ],
  outerwear: [
    {
      name: "Wool Coat",
      price: "$199.99",
      store: "Uniqlo",
      url: "https://www.uniqlo.com/us/en/search?q=women%20wool%20coat",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=600&fit=crop&crop=center",
      description: "Warm wool coat for winter"
    },
    {
      name: "Denim Jacket",
      price: "$69.99",
      store: "Madewell",
      url: "https://www.madewell.com/search2/index.jsp?N=0&Nloc=&Ntrm=denim%20jacket%20women&Npge=1&Nrpp=60",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=600&fit=crop&crop=center",
      description: "Classic denim jacket"
    },
    {
      name: "Blazer",
      price: "$149.99",
      store: "Theory",
      url: "https://www.theory.com/search?q=women%20blazer",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop&crop=center",
      description: "Professional blazer for work"
    }
  ],
  accessories: [
    {
      name: "Leather Handbag",
      price: "$199.99",
      store: "Coach",
      url: "https://www.coach.com/search?q=leather%20handbag%20women",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=600&fit=crop&crop=center",
      description: "Classic leather handbag"
    },
    {
      name: "Gold Jewelry Set",
      price: "$89.99",
      store: "Mejuri",
      url: "https://mejuri.com/shop/fine-jewelry?q=gold%20necklace",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=600&fit=crop&crop=center",
      description: "Delicate gold jewelry pieces"
    },
    {
      name: "Silk Scarf",
      price: "$49.99",
      store: "Hermès",
      url: "https://www.hermes.com/us/en/category/women/scarves-and-silks/",
      image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=600&fit=crop&crop=center",
      description: "Luxurious silk scarf"
    }
  ]
}

// Function to determine category from item name
function categorizeItem(itemName: string): string {
  const name = itemName.toLowerCase()
  
  if (name.includes('dress') || name.includes('gown')) return 'dresses'
  if (name.includes('shirt') || name.includes('blouse') || name.includes('top') || name.includes('sweater') || name.includes('tee')) return 'tops'
  if (name.includes('jeans') || name.includes('pants') || name.includes('trousers') || name.includes('skirt') || name.includes('shorts')) return 'bottoms'
  if (name.includes('shoe') || name.includes('boot') || name.includes('sneaker') || name.includes('heel') || name.includes('sandal')) return 'shoes'
  if (name.includes('jacket') || name.includes('coat') || name.includes('blazer') || name.includes('cardigan')) return 'outerwear'
  if (name.includes('bag') || name.includes('necklace') || name.includes('earring') || name.includes('bracelet') || name.includes('scarf') || name.includes('belt')) return 'accessories'
  
  // Default to tops if category can't be determined
  return 'tops'
}

export async function POST(req: NextRequest) {
  try {
    const { itemNames, occasion = "casual" } = await req.json()

    if (!itemNames || !Array.isArray(itemNames)) {
      return NextResponse.json({ error: "itemNames array is required" }, { status: 400 })
    }

    // For each item name, find similar items from our mock store data
    const similarItems = itemNames.map(itemName => {
      const category = categorizeItem(itemName)
      const categoryItems = mockStoreItems[category as keyof typeof mockStoreItems] || mockStoreItems.tops
      
      // Return 2-3 similar items per requested item
      return {
        requestedItem: itemName,
        category,
        alternatives: categoryItems.slice(0, 3)
      }
    })

    return NextResponse.json({
      success: true,
      similarItems,
      totalAlternatives: similarItems.reduce((sum, item) => sum + item.alternatives.length, 0)
    })

  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}