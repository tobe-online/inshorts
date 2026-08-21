import { BrowserRouter, Routes, Route } from "react-router-dom";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";
import InfluencerProfile from "./routes/InfluencerProfile";
import Glossary from "./routes/Glossary";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Topbar />
        <div className="flex-1">
          <Routes>
            <Route path="/influencers/:handle" element={<InfluencerProfile />} />
            <Route path="/glossary" element={<Glossary />} />
            <Route
              path="*"
              element={
                <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
                  <div className="card mx-auto max-w-md p-10 text-center">
                    <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#f2f2ee] text-lg">!</div>
                    <h1 className="mt-4 text-lg font-semibold text-ink">Page not available</h1>
                    <p className="mt-2 text-sm text-muted">
                      This site only serves individual creator trust profiles.
                    </p>
                    <div className="mt-6">
                      <a
                        href="/influencers/mai.saurav?platform=instagram"
                        className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                      >
                        View a sample profile
                      </a>
                    </div>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
