import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import News from '../../components/News/News';
import Services from '../../components/Services/Services';
import './mainPage.scss'

function MainPage () {
  return (
    <div className="page">
      <Header />
      <div className="page-content">
        <Services />
        <News />
      </div>
      <Footer />
    </div>
  )
}

export default MainPage;