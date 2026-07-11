import { Helmet } from 'react-helmet-async'
import Hero from '../components/Hero'
import MandiTicker from '../components/MandiTicker'
import Categories from '../components/Categories'
import FeaturedVegetables from '../components/FeaturedVegetables'

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Organic Fresh Store — Farm-Fresh Vegetables Delivered Daily</title>
        <meta
          name="description"
          content="Order fresh, organic vegetables and fruit online with same-day delivery slots. Locally sourced, chemical-free produce delivered to your door."
        />
      </Helmet>
      <Hero />
      <MandiTicker />
      <Categories />
      <FeaturedVegetables />
    </>
  )
}
