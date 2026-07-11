import Seo from '../components/Seo'
import Hero from '../components/Hero'
import MandiTicker from '../components/MandiTicker'
import Categories from '../components/Categories'
import FeaturedVegetables from '../components/FeaturedVegetables'

export default function Home() {
  return (
    <>
      <Seo
        title="Organic Fresh Store — Farm-Fresh Vegetables Delivered Daily"
        description="Order fresh, organic vegetables and fruit online with same-day delivery slots. Locally sourced, chemical-free produce delivered to your door."
      />
      <Hero />
      <MandiTicker />
      <Categories />
      <FeaturedVegetables />
    </>
  )
}
