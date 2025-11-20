import React from 'react'
import Hero from '../sections/Hero'
import Features from '../sections/features'

const Home = () => {
  console.log("Home page loaded");

  return (
    <div>
        <Hero/>
        <Features/>
    </div>
  )
}

export default Home