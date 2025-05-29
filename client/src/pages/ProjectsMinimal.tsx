import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ProjectsMinimal() {
  return (
    <div>
      <Header />
      <div style={{ padding: "2rem", minHeight: "60vh" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#2C3E50", marginBottom: "2rem", textAlign: "center" }}>
          Premium Real Estate Projects
        </h1>
        
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ fontSize: "1.2rem", color: "#666", lineHeight: "1.6" }}>
            Discover luxury developments by Egypt's most prestigious developers including EMAAR, Sodic, and Hassan Allam
          </p>
        </div>

        <div style={{ 
          backgroundColor: "white", 
          padding: "2rem", 
          borderRadius: "12px", 
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", 
          maxWidth: "600px", 
          margin: "0 auto" 
        }}>
          <div style={{ 
            backgroundColor: "#f5f5dc", 
            height: "200px", 
            borderRadius: "8px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            marginBottom: "1.5rem" 
          }}>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#d4af37", marginBottom: "0.5rem" }}>
                Marassi North Coast
              </h3>
              <p style={{ color: "#666" }}>Premium Beachfront Resort</p>
            </div>
          </div>
          
          <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#2C3E50", marginBottom: "0.5rem" }}>
            Marassi North Coast
          </h3>
          
          <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}>
            📍 North Coast, Egypt - 125km from Cairo
          </p>
          
          <p style={{ color: "#555", fontSize: "0.9rem", marginBottom: "1rem", lineHeight: "1.5" }}>
            An exclusive beachfront resort community by EMAAR Misr, featuring luxury villas, chalets, 
            and apartments with direct Mediterranean access on Egypt's pristine North Coast.
          </p>
          
          <div style={{ marginBottom: "1rem" }}>
            <span style={{ 
              backgroundColor: "#f0f0f0", 
              color: "#555", 
              padding: "0.25rem 0.5rem", 
              borderRadius: "4px", 
              fontSize: "0.8rem", 
              marginRight: "0.5rem" 
            }}>
              Luxury Villas
            </span>
            <span style={{ 
              backgroundColor: "#f0f0f0", 
              color: "#555", 
              padding: "0.25rem 0.5rem", 
              borderRadius: "4px", 
              fontSize: "0.8rem", 
              marginRight: "0.5rem" 
            }}>
              Beach Chalets
            </span>
            <span style={{ 
              backgroundColor: "#f0f0f0", 
              color: "#555", 
              padding: "0.25rem 0.5rem", 
              borderRadius: "4px", 
              fontSize: "0.8rem" 
            }}>
              Premium Apartments
            </span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem" }}>
            <span style={{ color: "#d4af37", fontWeight: "600", fontSize: "0.9rem" }}>
              🏢 EMAAR Misr
            </span>
            <a 
              href="/projects/marassi-north-coast" 
              style={{ 
                backgroundColor: "#d4af37", 
                color: "white", 
                padding: "0.5rem 1rem", 
                borderRadius: "6px", 
                textDecoration: "none", 
                fontSize: "0.9rem", 
                fontWeight: "500" 
              }}
            >
              View Details
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}