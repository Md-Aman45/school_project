import "../styles/globals.css";
import Navbar from "../pages/Navbar";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />;
    </>
  )
}
