import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import Services from '../../components/Services/Services';
import './mainPage.scss'

function MainPage () {
  return (
    <div className="page">
      <Header />
      <div className="page-content">
        <Services />
      </div>
      <Footer />
    </div>
  )
}

export default MainPage;