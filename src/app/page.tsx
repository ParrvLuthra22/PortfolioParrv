import Hero from "@/components/Hero";
import About from "@/components/About";
import Work from "@/components/Work";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main>
      {/* Hero Section - The Statement */}
      <section id="hero">
        <Hero />
      </section>

      {/* About Section - The Philosophy */}
      <section id="about">
        <About />
      </section>

      {/* Work Section - The Evidence */}
      <section id="work">
        <Work />
      </section>

      {/* Experience Section - Education & Projects */}
      <section id="experience">
        <Experience />
      </section>


      {/* Contact Section - The Invitation + Footer */}
      <section id="contact">
        <Contact />
      </section>
    </main>
  );
}
