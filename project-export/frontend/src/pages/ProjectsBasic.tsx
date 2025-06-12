export default function ProjectsBasic() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Simple Header */}
      <header style={{ 
        backgroundColor: "#2C3E50", 
        color: "white", 
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          The Views Real Estate
        </div>
        <nav>
          <a href="/" style={{ color: "white", textDecoration: "none", marginRight: "1rem" }}>Home</a>
          <a href="/properties" style={{ color: "white", textDecoration: "none", marginRight: "1rem" }}>Properties</a>
          <a href="/projects" style={{ color: "#D4AF37", textDecoration: "none", marginRight: "1rem" }}>Projects</a>
          <a href="/contact" style={{ color: "white", textDecoration: "none" }}>Contact</a>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ padding: "2rem", backgroundColor: "#f8f9fa" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ 
            fontSize: "3rem", 
            fontWeight: "bold", 
            color: "#2C3E50", 
            textAlign: "center", 
            marginBottom: "2rem" 
          }}>
            Premium Real Estate Projects
          </h1>
          
          <p style={{ 
            fontSize: "1.2rem", 
            color: "#666", 
            textAlign: "center", 
            marginBottom: "3rem",
            maxWidth: "800px",
            margin: "0 auto 3rem auto"
          }}>
            Discover luxury developments by Egypt's most prestigious developers including EMAAR, Sodic, and Hassan Allam
          </p>

          {/* Marassi North Coast Project */}
          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "12px", 
            padding: "2rem", 
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxWidth: "800px",
            margin: "0 auto"
          }}>
            {/* Project Image Placeholder */}
            <div style={{ 
              backgroundColor: "#f5f5dc", 
              height: "300px", 
              borderRadius: "8px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              marginBottom: "2rem",
              position: "relative"
            }}>
              <div style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: "2rem", fontWeight: "bold", color: "#d4af37", marginBottom: "0.5rem" }}>
                  Marassi North Coast
                </h2>
                <p style={{ color: "#666", fontSize: "1.1rem" }}>Premium Beachfront Resort by EMAAR</p>
              </div>
              <div style={{
                position: "absolute",
                top: "1rem",
                left: "1rem",
                backgroundColor: "#D4AF37",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "600"
              }}>
                Premium
              </div>
            </div>
            
            {/* Project Details */}
            <div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#2C3E50", marginBottom: "1rem" }}>
                Marassi North Coast
              </h3>
              
              <p style={{ color: "#666", fontSize: "1rem", marginBottom: "1rem" }}>
                📍 North Coast, Egypt - 125km from Cairo
              </p>
              
              <p style={{ 
                color: "#555", 
                fontSize: "1rem", 
                lineHeight: "1.6", 
                marginBottom: "1.5rem" 
              }}>
                An exclusive beachfront resort community by EMAAR Misr, featuring luxury villas, chalets, 
                and apartments with direct Mediterranean access on Egypt's pristine North Coast. This 
                premium development offers world-class amenities and stunning sea views.
              </p>
              
              {/* Unit Types */}
              <div style={{ marginBottom: "2rem" }}>
                <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2C3E50", marginBottom: "1rem" }}>
                  Available Unit Types:
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {["Luxury Villas", "Beach Chalets", "Premium Apartments", "Penthouses", "Townhouses"].map((type, index) => (
                    <span key={index} style={{ 
                      backgroundColor: "#f0f0f0", 
                      color: "#555", 
                      padding: "0.5rem 1rem", 
                      borderRadius: "6px", 
                      fontSize: "0.9rem",
                      fontWeight: "500"
                    }}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Developer Info and CTA */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                paddingTop: "1.5rem", 
                borderTop: "1px solid #eee" 
              }}>
                <div>
                  <span style={{ color: "#d4af37", fontWeight: "600", fontSize: "1rem" }}>
                    🏢 EMAAR Misr
                  </span>
                  <p style={{ color: "#666", fontSize: "0.9rem", margin: "0.5rem 0 0 0" }}>
                    World-renowned luxury developer
                  </p>
                </div>
                <a 
                  href="/projects/marassi-north-coast" 
                  style={{ 
                    backgroundColor: "#d4af37", 
                    color: "white", 
                    padding: "0.75rem 1.5rem", 
                    borderRadius: "8px", 
                    textDecoration: "none", 
                    fontSize: "1rem", 
                    fontWeight: "600",
                    transition: "background-color 0.3s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#b8941f"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#d4af37"}
                >
                  View Details
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer style={{ 
        backgroundColor: "#2C3E50", 
        color: "white", 
        padding: "2rem", 
        textAlign: "center" 
      }}>
        <p>© 2024 The Views Real Estate. All rights reserved.</p>
      </footer>
    </div>
  );
}