import './Page404.scss'
import img from '../../assets/404.png'
import { Link } from 'react-router-dom';

const Page404 = () => {
  return (
    <div className='page404'>
      <div className='page404-info'>
        <h1 className='inter28-600'>
          Страница не найдена
        </h1>
        <p className='page404-text inter16-400'>
          Запрошенная вами страница не 
          существует или была перемещена
        </p>
        <Link to={'/'} className='page404-link accent-btn inter16-600'>
          На главную
        </Link>
      </div>
      <div className='page404-img'>
        <img src={img} alt="" />
      </div>
    </div>
  )
}

export default Page404;