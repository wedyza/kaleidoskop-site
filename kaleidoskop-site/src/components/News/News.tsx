import './news.scss'
import news from '../../assets/news.jpg'
import saw from '../../assets/saw.png'

const News: React.FC = () => {
  return (
    <div className='news'>
      <div className="news-head">
        <h2 className='news_title inter28-600'>
          <span className='news_title__grey'>Пока другие пилят смету — </span>мы пилим новости
          <div className="news_title-icon">
            <img src={saw} alt="" />
          </div>
        </h2>
        <div className="news_open inter14-600 second-btn">Все новости</div>
      </div>
      <div className="news-list">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="news-card">
            <img src={news} alt="" />
            <div className="news-card_overlay"></div>
            <div className="news-card_text">
              <div className="news-card_date inter14-600">25.11.2025</div>
              <div className="news-card_title inter24-600">
                Открыли 
                экспресс-доставку 
                в соседние районы
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default News;