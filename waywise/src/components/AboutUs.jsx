import {
  ArrowLeft,
  ArrowRight,
  CarFront,
  MapPin,
  Route,
  TrafficCone,
  Camera,
  Bell,
  IndianRupee,
  ShieldCheck,
  Navigation,
  CheckCircle2,
  Target,
  Lightbulb,
} from "lucide-react";

import "../aboutUs.css";

const problems = [
  {
    icon: Route,
    title: "Confusing Route Suggestions",
    description:
      "Traditional navigation apps often recommend routes automatically, leaving commuters with limited clarity about alternative choices.",
  },
  {
    icon: Navigation,
    title: "Unclear Navigation Instructions",
    description:
      "Complicated directions and unfamiliar roads can make everyday journeys stressful.",
  },
  {
    icon: Camera,
    title: "Lack of Visual Guidance",
    description:
      "Text-based navigation can be difficult to follow without recognizable landmarks or image-based guidance.",
  },
  {
    icon: TrafficCone,
    title: "Unexpected Roadblocks",
    description:
      "Traffic congestion, road closures, and diversions can disrupt a journey without sufficient warning.",
  },
  {
    icon: IndianRupee,
    title: "Unclear Travel Costs",
    description:
      "Toll charges and estimated fares are not always easy to compare before choosing a route.",
  },
  {
    icon: Bell,
    title: "Delayed Travel Updates",
    description:
      "Commuters need timely information about heavy traffic, roadblocks, and changing road conditions.",
  },
];

const solutions = [
  {
    icon: Route,
    title: "Compare Routes",
    description:
      "Compare available route options based on estimated time, distance, fares, and toll charges.",
    status: "Available in demo",
  },
  {
    icon: CarFront,
    title: "Cab Booking Experience",
    description:
      "Explore different vehicle categories, compare sample fares, and simulate a cab booking.",
    status: "Available in demo",
  },
  {
    icon: Camera,
    title: "Image-Based Navigation",
    description:
      "We envision navigation supported by recognizable landmarks and visual references.",
    status: "Planned feature",
  },
  {
    icon: TrafficCone,
    title: "Traffic & Roadblock Alerts",
    description:
      "Our goal is to provide timely warnings about congestion, closures, and route disruptions.",
    status: "Planned feature",
  },
  {
    icon: IndianRupee,
    title: "Transparent Fare Comparison",
    description:
      "Help commuters understand estimated travel costs and toll charges before making a decision.",
    status: "Available in demo",
  },
  {
    icon: Bell,
    title: "Instant Journey Updates",
    description:
      "We aim to keep commuters informed when road conditions change during their journey.",
    status: "Planned feature",
  },
];

export default function AboutUs({ onBack, onBookCab }) {
  return (
    <section className="about-page">
      {/* HERO SECTION */}

      <div className="about-hero">
        <button
          type="button"
          className="about-back"
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
            Smarter Routes.
            <br />
            <span>Simpler Commutes.</span>
          </h1>

          <p>
            WayWise is a student-built mobility platform
            designed to make everyday commuting by cab
            easier, clearer, and more convenient.
          </p>

          <div className="about-hero-actions">
            <button
              type="button"
              className="about-primary-btn"
              onClick={onBookCab}
            >
              Explore Cab Booking
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

      {/* INTRODUCTION */}

      <div className="about-container">
        <section className="about-intro">
          <span className="about-section-label">
            WHO WE ARE
          </span>

          <h2>
            Making everyday travel less complicated.
          </h2>

          <p>
            Every day, students, professionals, and
            commuters depend on navigation applications
            to reach their destinations.
          </p>

          <p>
            However, finding a route is not always the
            same as understanding it. Automatic route
            recommendations, unclear directions,
            unexpected traffic, and hidden travel
            expenses can make even familiar journeys
            frustrating.
          </p>

          <p>
            WayWise was created around a simple idea:
            <strong>
              {" "}commuters should have more clarity
              and control over how they travel.
            </strong>
          </p>
        </section>

        {/* PROBLEMS */}

        <section className="about-section">
          <div className="about-section-heading">
            <span className="about-section-label">
              THE PROBLEM
            </span>

            <h2>
              Why does everyday navigation
              feel so complicated?
            </h2>

            <p>
              We identified common challenges that
              can make daily commuting stressful.
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

        {/* SOLUTIONS */}

        <section className="about-section">
          <div className="about-section-heading">
            <span className="about-section-label">
              OUR APPROACH
            </span>

            <h2>
              A smarter way to plan your journey.
            </h2>

            <p>
              WayWise brings route comparison and
              a cab-booking prototype together,
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

        {/* MISSION AND VISION */}

        <section className="about-mission-grid">
          <article className="about-mission-card">
            <div className="about-icon solution-icon">
              <Target size={25} />
            </div>

            <h2>Our Mission</h2>

            <p>
              To simplify daily commuting by helping
              people compare routes, understand travel
              costs, and make informed transportation
              decisions.
            </p>
          </article>

          <article className="about-mission-card">
            <div className="about-icon solution-icon">
              <Lightbulb size={25} />
            </div>

            <h2>Our Vision</h2>

            <p>
              To build a commuter-friendly mobility
              experience where navigation is intuitive,
              travel information is transparent, and
              changing road conditions are easier
              to understand.
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
            We believe navigation should empower
            commuters instead of overwhelming them.
            WayWise is being developed to make
            travel planning more transparent,
            accessible, and user-friendly.
          </p>
        </section>

        {/* CTA */}

        <section className="about-cta">
          <div>
            <span className="about-section-label">
              GET STARTED
            </span>

            <h2>
              Ready to explore a smarter commute?
            </h2>

            <p>
              Try our cab-booking prototype and
              discover how WayWise helps you
              compare travel options.
            </p>
          </div>

          <button
            type="button"
            className="about-primary-btn"
            onClick={onBookCab}
          >
            Book a Demo Cab
            <ArrowRight size={17} />
          </button>
        </section>
      </div>
    </section>
  );
}