import Hero from "@/components/Hero";
import About from "@/components/About";
import Work from "@/components/Work";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

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

      {/* Process Section - The Method */}
      <section id="process">
        <Process />
      </section>

      {/* Contact Section - The Invitation */}
      <section id="contact">
        <Contact />
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
