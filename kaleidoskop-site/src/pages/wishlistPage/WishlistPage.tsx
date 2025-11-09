import ItemCardBig from '../../components/ItemCardBig/ItemCardBig';
import './WishlistPage.scss'

function WishlistPage () {
  return (
    <div className="wishlist-section">
      <div className="wishlist-header">
        <h1 className='inter28-600'>Избранные товары</h1>
        <button className='wishlist-clear inter13-400'>
          <div className="wishlist-clear_img">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M0.219259 0.219644C0.512152 -0.0732486 0.987026 -0.0732489 1.27992 0.219644L5.99223 4.93195L10.7045 0.219644C10.9974 -0.0732486 11.4723 -0.0732489 11.7652 0.219644C12.0581 0.512537 12.0581 0.987412 11.7652 1.2803L7.05289 5.99261L11.7652 10.7049C12.0581 10.9978 12.0581 11.4727 11.7652 11.7656C11.4723 12.0585 10.9974 12.0585 10.7045 11.7656L5.99223 7.05327L1.27992 11.7656C0.987026 12.0585 0.512152 12.0585 0.219259 11.7656C-0.0736338 11.4727 -0.0736338 10.9978 0.219259 10.7049L4.93157 5.99261L0.219259 1.2803C-0.0736338 0.987411 -0.0736338 0.512538 0.219259 0.219644Z" fill="#888888"/>
            </svg>
          </div>
          <span className='wishlist-clear_label'>Очистить избранное</span>
        </button>
      </div>
      <div className="wishlist-content">
        <ItemCardBig />
        <ItemCardBig />
        <ItemCardBig />
        <ItemCardBig />
        <ItemCardBig />
      </div>
    </div>
  )
}

export default WishlistPage;