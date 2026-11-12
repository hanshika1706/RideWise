
import {
  ArrowLeft,
  ArrowRight,
  CarFront,
  Route,
  TrafficCone,
  Bike,
  IndianRupee,
  ShieldCheck,
  Navigation,
  CheckCircle2,
  Target,
  Lightbulb,
  Map,
  Calculator,
  Clock3,
  Wallet,
  MapPin,
} from "lucide-react";

import "../aboutUs.css";

const problems = [
  {
    icon: Route,
    title: "Too Many Route Choices",
    description:
      "Commuters often struggle to understand alternative routes and decide which journey offers the best balance of time, distance and cost.",
  },
  {
    icon: Clock3,
    title: "Uncertain Travel Time",
    description:
      "Choosing a route without understanding its estimated journey duration can make everyday travel difficult to plan.",
  },
  {
    icon: IndianRupee,
    title: "Unpredictable Travel Expenses",
    description:
      "Different transportation options come with different pricing structures, making it difficult to estimate the total cost beforehand.",
  },
  {
    icon: Wallet,
    title: "Hidden Toll & Fare Costs",
    description:
      "Base fares, distance charges and toll expenses can make it difficult for commuters to understand what they are actually paying for.",
  },
  {

    icon: IndianRupee,
    title: "Unclear Travel Expenses",
    description:
      "Commuters may find it difficult to compare transportation costs and understand how distance, vehicle type, and tolls affect their fares.",
  },
  {
    icon: Navigation,
    title: "Limited Travel Flexibility",
    description:
      "Not every commuter has the same priorities. Some prefer the fastest route, while others want the most economical option.",
  },
  {
    icon: MapPin,
    title: "Fragmented Travel Information",
    description:
      "Finding route information, comparing transportation costs and planning a journey across different platforms can be inconvenient."
  },
];

const solutions = [
  {
    icon: Map,
    title: "Mappls-Powered Navigation",
    description:
      "Explore interactive maps and access route information through our integrated Mappls Maps API.",
    status: "Available in demo",
  },
  {
    icon: IndianRupee,
    title: "Multi-Vehicle Fare Comparison",
    description:
      "Compare estimated fares for Hatchbacks, Sedans, Auto Rickshaws, and Bike Taxis using route distance and toll inputs.",
    status: "Available in demo",
  },
  {
    icon: Calculator,
    title: "Multi-Vehicle Fare Calculator",
    description:
      "Get estimated travel costs for Sedan, Hatchback, Auto Rickshaw and Bike Taxi options using distance-based fare calculations.",
    status: "Available in demo",
  },
  {
    icon: IndianRupee,
    title: "Transparent Fare Breakdown",
    description:
      "Understand how your estimated fare is calculated through base fare, distance charges and applicable toll costs.",
    status: "Available in demo",
  },
  {
    icon: CarFront,
    title: "Transparent Fare Breakdown",
    description:
      "Help commuters understand estimated base fares, distance charges, and toll costs before making a travel decision.",
    status: "Available in demo",
  },
  {
    icon: TrafficCone,
    title: "Traffic & Road Condition Alerts",
    description:
      "Our future roadmap includes better awareness of road disruptions, congestion and unexpected travel conditions.",
    status: "Planned feature",
  },
];

export default function AboutUs({ onBack, onCompareFares }) {
  return (
    <section className="about-page">

      {/* HERO SECTION */}

      <div className="about-hero">
        <button
          type="button"
          className="about-primary-btn"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Back to Home
        </button>

        <div className="about-hero-content">
          <span className="about-badge">
            ABOUT WAYWISE
          </span>

          <h1>
            Smarter Mobility.
            <br />
            <span>Better Journeys.</span>
          </h1>

          <p>
            WayWise is a smart mobility and route-planning
            platform designed to help everyday commuters
            compare routes, estimate travel expenses and
            make more informed transportation decisions.
          </p>

          <div className="about-hero-actions">
            <button
              type="button"
              className="about-primary-btn"
              onClick={onCompareFares}
            >
              Explore Fare Comparison
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="about-outline-btn"
              onClick={onBack}
            >
              Explore WayWise
            </button>
          </div>
        </div>
      </div>

      <div className="about-container">

        {/* INTRODUCTION */}

        <section className="about-intro">
          <span className="about-section-label">
            WHO WE ARE
          </span>

          <h2>
            Making every journey a smarter decision.
          </h2>

          <p>
            Travelling from one place to another should
            be simple. Yet, commuters frequently face
            questions about which route to take, how
            long the journey will take and how much
            the trip will cost.
          </p>

          <p>
            WayWise brings essential travel-planning
            information together in one platform.
            With Mappls-powered mapping, intelligent
            route comparison and a multi-vehicle fare
            calculation system, users can explore
            different travel options before beginning
            their journey.
          </p>

          <p>
            Our idea is simple:
            <strong>
              {" "}give commuters the information,
              flexibility and confidence to choose
              the journey that works best for them.
            </strong>
          </p>
        </section>

        {/* PROBLEM SECTION */}

        <section className="about-section">
          <div className="about-section-heading">
            <span className="about-section-label">
              THE CHALLENGE
            </span>

            <h2>
              Travel planning should not be complicated.
            </h2>

            <p>
              We identified some everyday commuting
              challenges that inspired the development
              of WayWise.
            </p>
          </div>

          <div className="about-grid">
            {problems.map((problem) => {
              const Icon = problem.icon;

              return (
                <article
                  className="about-card"
                  key={problem.title}
                >
                  <div className="about-icon problem-icon">
                    <Icon size={23} />
                  </div>

                  <h3>{problem.title}</h3>

                  <p>{problem.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* FEATURES SECTION */}

        <section className="about-section">
          <div className="about-section-heading">
            <span className="about-section-label">
              WHAT WAYWISE OFFERS
            </span>

            <h2>
              Everything you need to plan a better journey.
            </h2>

            <p>
              WayWise brings route comparison and
              multi-vehicle fare estimation together,
              with more intelligent navigation
              capabilities planned for the future.
            </p>
          </div>

          <div className="about-grid">
            {solutions.map((solution) => {
              const Icon = solution.icon;

              return (
                <article
                  className="about-card solution-card"
                  key={solution.title}
                >
                  <div className="about-icon solution-icon">
                    <Icon size={23} />
                  </div>

                  <h3>{solution.title}</h3>

                  <p>{solution.description}</p>

                  <span
                    className={
                      solution.status === "Available in demo"
                        ? "about-status available"
                        : "about-status planned"
                    }
                  >
                    {solution.status === "Available in demo" && (
                      <CheckCircle2 size={13} />
                    )}

                    {solution.status}
                  </span>
                </article>
              );
            })}
          </div>
        </section>

        {/* FEATURE HIGHLIGHT */}

        <section className="about-section">
          <div className="about-section-heading">
            <span className="about-section-label">
              FEATURE SPOTLIGHT
            </span>

            <h2>
              More than navigation. Smarter fare decisions.
            </h2>

            <p>
              Our multi-vehicle fare calculation engine
              uses route distance and toll information
              to provide estimated transportation costs.
            </p>
          </div>

          <div className="about-grid">
            <article className="about-card solution-card">
              <div className="about-icon solution-icon">
                <CarFront size={23} />
              </div>

              <h3>Cab Fare Estimation</h3>

              <p>
                Estimate Sedan and Hatchback fares using
                a base fare, per-kilometre rate and
                applicable toll charges.
              </p>

              <span className="about-status available">
                <CheckCircle2 size={13} />
                Available in demo
              </span>
            </article>

            <article className="about-card solution-card">
              <div className="about-icon solution-icon">
                <Navigation size={23} />
              </div>

              <h3>Auto Fare Estimation</h3>

              <p>
                Calculate estimated Auto Rickshaw costs
                using a metered fare structure and
                journey distance.
              </p>

              <span className="about-status available">
                <CheckCircle2 size={13} />
                Available in demo
              </span>
            </article>

            <article className="about-card solution-card">
              <div className="about-icon solution-icon">
                <Bike size={23} />
              </div>

              <h3>Bike Taxi Estimation</h3>

              <p>
                Explore a budget-friendly Bike Taxi
                option with distance-based estimated
                fare calculations.
              </p>

              <span className="about-status available">
                <CheckCircle2 size={13} />
                Available in demo
              </span>
            </article>

            <article className="about-card solution-card">
              <div className="about-icon solution-icon">
                <IndianRupee size={23} />
              </div>

              <h3>Detailed Fare Breakdown</h3>

              <p>
                Understand the components of your
                estimated journey cost:
                Base Fare + Distance Fare + Tolls.
              </p>

              <span className="about-status available">
                <CheckCircle2 size={13} />
                Available in demo
              </span>
            </article>
          </div>
        </section>

        {/* MISSION AND VISION */}

        <section className="about-mission-grid">
          <article className="about-mission-card">
            <div className="about-icon solution-icon">
              <Target size={25} />
            </div>

            <h2>Our Mission</h2>

            <p>
              To make everyday commuting more convenient
              and transparent by bringing route comparison,
              interactive mapping and intelligent fare
              estimation together in one accessible platform.
            </p>
          </article>

          <article className="about-mission-card">
            <div className="about-icon solution-icon">
              <Lightbulb size={25} />
            </div>

            <h2>Our Vision</h2>

            <p>
              To create a smarter mobility experience
              where every commuter can explore
              transportation choices, understand travel
              costs and make confident journey decisions.
            </p>
          </article>
        </section>

        {/* VALUES */}

        <section className="about-values">
          <ShieldCheck size={28} />

          <h2>
            Your Journey. Your Choice.
          </h2>

          <p>
            We believe better travel begins with better
            information. WayWise is built around the idea
            that commuters should have the freedom to
            compare, evaluate and choose how they travel,
            without unnecessary complexity.
          </p>
        </section>

        {/* CTA */}

        <section className="about-cta">
          <div>
            <span className="about-section-label">
              EXPERIENCE WAYWISE
            </span>

            <h2>
              Ready to make your next journey smarter?
            </h2>

            <p>
              Explore our fare comparison experience
              and discover how WayWise helps you
              compare travel options.
            </p>
          </div>

          <button
            type="button"
            className="about-primary-btn"
            onClick={onCompareFares}
          >
            Compare Travel Fares
            <ArrowRight size={17} />
          </button>
        </section>

      </div>
    </section>
  );
}
