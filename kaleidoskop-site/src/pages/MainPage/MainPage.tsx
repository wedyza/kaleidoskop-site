import ItemsBlock from '../../components/ItemsBlock/ItemsBlock';
import News from '../../components/News/News';
import Services from '../../components/Services/Services';
import './MainPage.scss'

function MainPage () {
  return (
    <div className="page-main">
      <Services />
      <ItemsBlock 
        title={'Горячие предложения'}
        icon
        dates={'01.07 - 16.07'}
      />
      <ItemsBlock 
        title={'Популярные товары'}
      />
      <ItemsBlock 
        title={'Новинки'}
      />
      <News />
    </div>
  )
}

export default MainPage;