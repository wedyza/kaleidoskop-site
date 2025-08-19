import './news.scss'
import news from '../../img/news.jpg'

function News () {
  return (
    <div className='news'>
      <div className="news-head">
        <h2 className='news_title inter28-600'>
          <span className='news_title__grey'>Пока другие пилят смету — </span>мы пилим новости
        </h2>
        <div className="news_open inter14-400 accent-border">Все новости</div>
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