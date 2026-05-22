import "./AdminTelegram.scss";
import qr from "../../assets/qr.png";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useState, useEffect } from "react";
import { connectTelegram } from "../../features/admin/telegramSlice";

const AdminTelegram = () => {
  const tg = "@kaleidoskop_notification_bot ";
  const dispatch = useAppDispatch();
  const { connecting, error, success } = useAppSelector(
    (state) => state.telegram,
  );
  const [code, setCode] = useState("");
  // const [copySuccess, setCopySuccess] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tg);
      // setCopySuccess(true)
      // setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error("Ошибка копирования:", error);
    }
  };

  const handleConnect = () => {
    if (code.trim()) {
      dispatch(connectTelegram({ code: code.trim() }));
    }
  };

  useEffect(() => {
    if (success) {
      setCode("");
    }
  }, [success]);

  return (
    <div className="admin-tg">
      <div className="admin-head">
        <div className="admin-head_icon">
          <svg
            width="17"
            height="14"
            viewBox="0 0 17 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M16.4403 0.134809C16.6112 0.272149 16.6945 0.490254 16.6584 0.705703L14.6258 12.8269C14.5916 13.031 14.455 13.2037 14.2634 13.2848C14.0719 13.3659 13.8519 13.3443 13.6801 13.2275L9.01731 10.0565L6.73385 12.3459C6.55988 12.5203 6.2972 12.5731 6.0687 12.4796C5.8402 12.3861 5.69107 12.1648 5.69107 11.9192V8.00038L0.523549 7.26664C0.2497 7.22775 0.0364978 7.01051 0.00419717 6.73744C-0.0281034 6.46436 0.128591 6.20389 0.385899 6.10294L15.833 0.0423374C16.0374 -0.0378596 16.2694 -0.00253191 16.4403 0.134809ZM6.91058 8.62377L7.99413 9.36065L6.91058 10.447V8.62377ZM9.29525 8.77681C9.28907 8.77243 9.28282 8.76818 9.27651 8.76406L7.36797 7.46613L15.2148 1.94165L13.58 11.6907L9.29525 8.77681ZM11.5837 3.01266L2.97492 6.39029L6.14659 6.84064L11.5837 3.01266Z"
              fill="#454545"
            />
          </svg>
        </div>
        <h1 className="admin-head_title inter16-600">Telegram уведомления</h1>
      </div>

      <div className="admin-tg_info">
        <p className="inter20-600">
          Подключите Telegram уведомления для отслеживания новых заказов
        </p>
        <p className="admin-tg_desc inter14-400">
          Следуйте инструкции для подключения Telegram-бота, чтобы получать
          уведомления о новых заказах
        </p>
      </div>

      <div className="admin-tg_content">
        <div className="admin-tg_card admin-tg_first-step">
          <h2 className="admin-tg_card-title inter16-600">1 Шаг</h2>
          <p className="admin-tg_card-desc inter14-400">
            Перейдите по QR-коду или найдите в поиске по чтобы подключить бота
          </p>
          <div className="admin-tg_card-address">
            <span className="admin-tg_card-address-text inter16-600">{tg}</span>
            <button
              className="admin-tg_card-address-btn"
              onClick={handleCopy}
              aria-label="Копировать"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.75 9.41667H2.08333C1.72971 9.41667 1.39057 9.27619 1.14052 9.02614C0.890476 8.77609 0.75 8.43695 0.75 8.08333V2.08333C0.75 1.72971 0.890476 1.39057 1.14052 1.14052C1.39057 0.890476 1.72971 0.75 2.08333 0.75H8.08333C8.43695 0.75 8.77609 0.890476 9.02614 1.14052C9.27619 1.39057 9.41667 1.72971 9.41667 2.08333V2.75M6.75 5.41667H12.75C13.4864 5.41667 14.0833 6.01362 14.0833 6.75V12.75C14.0833 13.4864 13.4864 14.0833 12.75 14.0833H6.75C6.01362 14.0833 5.41667 13.4864 5.41667 12.75V6.75C5.41667 6.01362 6.01362 5.41667 6.75 5.41667Z"
                  stroke="#B0B0B0"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
          {/* {copySuccess && (
            <div className='admin-tg_copy-success'>
              Скопировано
            </div>
          )} */}
          <div className="admin-tg_card-qr">
            <img src={qr} className="admin-tg_card-qr-img" alt="qr" />
          </div>
        </div>
        <div className="admin-tg_card admin-tg_second-step">
          <h2 className="admin-tg_card-title inter16-600">2 Шаг</h2>
          <p className="admin-tg_card-desc inter14-400">
            Отправьте команду{" "}
            <span className="inter14-600 admin-tg_card__strong">/start </span>и
            затем следуйте инструкциям в Telegram-боте, чтобы получить код
            сессии
          </p>

          <input
            type="text"
            className="admin-tg_card-input inter14-300"
            placeholder="Введите код сессии"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={connecting}
          />

          {error && <div className="admin-tg_error">{error}</div>}

          {success && (
            <div className="admin-tg_success">Telegram успешно подключен</div>
          )}

          <button
            className="admin-tg_card-btn accent-btn inter14-400"
            onClick={handleConnect}
            disabled={connecting || !code.trim()}
          >
            {connecting ? "Подключение..." : "Подключиться"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTelegram;
