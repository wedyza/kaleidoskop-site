import { Link, useNavigate, useParams } from "react-router-dom";
import "./AdminCompilationsCreate.scss";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  createCompilation,
  fetchCompilationById,
  updateCompilation,
} from "../../features/admin/adminCompilationsSlice";
import Toggle from "../../components/ui/Toggle/Toggle";
import { fetchProducts } from "../../features/products/productsSlice";

const AdminCompilationsCreate = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.adminCompilations);
  const products = useAppSelector((state) => state.products.items);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const [formData, setFormData] = useState({
    title: "",
    start_time: "",
    end_time: "",
    active: false,
  });

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;

    const data: {
      title: string;
      start_time?: string;
      end_time?: string;
      active?: boolean;
    } = {
      title: formData.title,
      active: formData.active,
    };

    if (formData.start_time) data.start_time = formData.start_time;
    if (formData.end_time) data.end_time = formData.end_time;

    try {
      if (id) {
        await dispatch(updateCompilation({ id, data })).unwrap();
      } else {
        await dispatch(createCompilation(data)).unwrap();
      }
      navigate("/admin/compilations");
    } catch (error) {
      console.error("Ошибка при сохранении подборки:", error);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchCompilationById(id)).then((res) => {
        if (res.payload) {
          const compilation = res.payload;
          setFormData({
            title: compilation.title || "",
            start_time: compilation.start_time?.split("T")[0] || "",
            end_time: compilation.end_time?.split("T")[0] || "",
            active: compilation.active || false,
          });
        }
      });
    }
  }, [id, dispatch]);

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, active: !prev.active }));
  };

  return (
    <div className="admin-comp-create">
      <div className="admin-head">
        <div className="admin-head_icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.63284 0.0313396C7.79347 0.157724 6.92367 0.650188 6.39308 1.3039C6.27131 1.45207 6.0756 1.77021 5.95818 2.00991C5.73638 2.46315 5.63635 2.80308 5.58851 3.30426L5.55807 3.60061H4.39688C3.18785 3.60061 2.93995 3.63111 2.37023 3.81851C1.48302 4.11486 0.639312 4.93854 0.265295 5.87117C-0.00434479 6.54667 4.2471e-06 6.41593 4.2471e-06 12.4998C4.2471e-06 18.3658 4.2471e-06 18.3571 0.20006 18.8365C0.391417 19.2984 0.756736 19.6819 1.16989 19.8606C1.65264 20.0741 2.42242 20.0349 2.98344 19.7734C3.13566 19.7037 4.09679 19.1764 5.12317 18.6055C6.91932 17.6031 6.9889 17.5682 7.2194 17.5682C7.4499 17.5682 7.52383 17.6075 9.35913 18.6273C10.4029 19.2112 11.3814 19.7342 11.5336 19.7996C12.3208 20.1221 13.1036 20.0524 13.6777 19.6122C13.8908 19.4509 14.1953 18.9759 14.3127 18.6142C14.4084 18.3222 14.4127 18.235 14.4344 16.5354L14.4605 14.7616L15.7435 15.4807C16.4654 15.8817 17.1482 16.2347 17.3092 16.287C17.9137 16.4744 18.5486 16.4308 18.9879 16.1737C19.4489 15.9035 19.8533 15.302 19.9621 14.7355C19.9969 14.5481 20.0056 12.879 19.9969 8.74314C19.9795 2.25832 20.0143 2.83794 19.6141 2.00991C19.2401 1.23853 18.753 0.750423 17.9833 0.375629C17.1743 -0.0165977 17.5179 0.00955009 12.9384 0.000833511C10.716 -0.00352478 8.77636 0.00955009 8.63284 0.0313396ZM16.7699 1.46951C17.631 1.6264 18.366 2.36291 18.5225 3.22581C18.5573 3.40449 18.5704 5.2436 18.5704 8.96104V14.4348L18.4573 14.6658C18.3834 14.8139 18.3007 14.9098 18.2268 14.9403C17.9615 15.0406 17.805 14.9708 16.1001 14.0164L14.4431 13.0881L14.4301 9.83702C14.4127 6.63383 14.4127 6.58153 14.317 6.27211C14.1213 5.62711 13.8734 5.18695 13.4429 4.72499C13.0167 4.25868 12.5122 3.95361 11.8424 3.74442L11.4597 3.62675L9.233 3.60932C7.4673 3.60061 7.00195 3.58317 7.00195 3.53959C7.00195 3.34348 7.11937 2.92075 7.2455 2.6549C7.51948 2.07528 8.14575 1.59153 8.76331 1.47386C9.08079 1.41285 16.4394 1.40849 16.7699 1.46951ZM11.3249 5.10414C12.173 5.32641 12.8166 6.01498 12.9558 6.85609C12.9906 7.06964 13.0036 8.70392 12.9949 12.6436L12.9819 18.1348L12.8862 18.3178C12.7731 18.5227 12.6166 18.5924 12.3382 18.5575C12.2295 18.5445 11.5641 18.2002 10.3377 17.5116C9.32868 16.9494 8.36755 16.4221 8.19793 16.3436C7.66735 16.0909 7.03239 16.0516 6.48007 16.239C6.34959 16.2826 5.36236 16.8099 4.2925 17.4114C3.09217 18.0781 2.25715 18.5183 2.12668 18.5488C1.83965 18.6185 1.67873 18.5532 1.55261 18.3135L1.45693 18.1348L1.44388 12.6436C1.43519 8.70392 1.44823 7.06964 1.48302 6.85609C1.61785 6.02806 2.2615 5.33076 3.09652 5.1085C3.44879 5.01262 10.9596 5.00827 11.3249 5.10414Z"
              fill="#161616"
            />
          </svg>
        </div>
        <h1 className="admin-head_title inter16-600">Подборки</h1>
      </div>

      <div className="cat-form_head">
        <Link to="/admin/compilations" className="cat-form_back">
          <div className="cat-form_back-icon">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.28033 0.21967C7.57322 0.512563 7.57322 0.987437 7.28033 1.28033L2.56066 6H13.25C13.6642 6 14 6.33579 14 6.75C14 7.16421 13.6642 7.5 13.25 7.5H2.56066L7.28033 12.2197C7.57322 12.5126 7.57322 12.9874 7.28033 13.2803C6.98744 13.5732 6.51256 13.5732 6.21967 13.2803L0.21967 7.28033C-0.0732233 6.98744 -0.0732233 6.51256 0.21967 6.21967L6.21967 0.21967C6.51256 -0.0732233 6.98744 -0.0732233 7.28033 0.21967Z"
                fill="#888888"
              />
            </svg>
          </div>
          <span className="cat-form_back-text inter13-500">Назад</span>
        </Link>

        <div className="cat-form_info">
          <div className="cat-form_info-title inter13-600">
            {formData.title ||
              (id ? "Редактирование подборки" : "Название подборки")}
          </div>
          <div className="cat-form_info-acts admin-comp_acts">
            <Toggle
              isActive={formData.active}
              onToggle={handleToggle}
              activeText="Активна"
              inactiveText="Отключена"
            />
            <button
              className="cat-form_save accent-btn inter12-600"
              onClick={handleSubmit}
              disabled={loading}
            >
              {!id ? "Создать" : "Сохранить изменения"}
            </button>
          </div>
        </div>
      </div>

      <div className="cat-form_main">
        <div className="cat-form_main-info">
          <h2 className="cat-form_title inter16-600">Основная информация</h2>
          <p className="cat-form_desc inter14-400">
            Укажите название подборки, задайте период её активности (с какой
            даты по какую)
          </p>
        </div>
        <form className="category-form">
          <div className="category-form_group">
            <label className="category-form_label inter13-400">
              Название подборки
            </label>
            <div className="category-form_input">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTextChange}
                className={`inter14-400`}
                placeholder={`Название подборки`}
                disabled={loading}
              />
              <div className="category-form_input-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.43349 2.33346L10.4311 1.33583C11.2122 0.554784 12.4785 0.554784 13.2595 1.33583L13.9666 2.04294C14.7477 2.82399 14.7477 4.09032 13.9666 4.87137L12.969 5.86899M9.43349 2.33346L1.50611 10.2608C1.17404 10.5929 0.969411 11.0312 0.928086 11.4991L0.754518 13.4638C0.699746 14.0839 1.21862 14.6027 1.83864 14.548L3.80343 14.3744C4.27123 14.3331 4.70957 14.1284 5.04165 13.7964L12.969 5.86899M9.43349 2.33346L12.969 5.86899"
                    stroke="#AAB0B6"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
            {/* {errors.title && <span className="category_error-message">{errors.title}</span>} */}
          </div>

          <div className="category-form_group admin-comp_dates">
            <span className="admin-comp_dates-label inter13-400">
              Период активности
            </span>
            <div className="admin-comp_dates-inputs inter14-600">
              <input
                type="date"
                name="start_time"
                value={formData.start_time}
                onChange={handleTextChange}
                className="admin-comp_dates-input"
                disabled={loading}
              />

              <input
                type="date"
                name="end_time"
                value={formData.end_time}
                onChange={handleTextChange}
                className="admin-comp_dates-input"
                disabled={loading}
              />
            </div>
          </div>
        </form>
      </div>
      {id && (
        <div className="cat-form_main">
          <div className="cat-form_main-info">
            <h2 className="cat-form_title inter16-600">
              Добавление товаров в подборку
            </h2>
            <p className="cat-form_desc inter14-400">
              Выберите номенклатуры товаров, которые будут входить в подборку
            </p>
          </div>
          <div className="admin-comp_noms">
            <div className="comp-search">
              <button
                className="comp-search_btn"
                //onClick={handleSearchClick}
                aria-label="Поиск"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.41343 0C9.95547 0 12.8269 2.85342 12.8269 6.37329C12.8269 7.82769 12.2037 9.31328 11.3785 10.3858L15.717 14.6944C16.0256 15.024 16.0996 15.419 15.8502 15.751C15.6008 16.083 15.0071 16.083 14.6406 15.7512L10.301 11.4426C9.22245 12.2607 7.87504 12.7466 6.41343 12.7466C2.87139 12.7466 0 9.89316 0 6.37329C0 2.85342 2.87139 0 6.41343 0ZM6.41346 1.35591C3.52353 1.35591 1.33089 3.49956 1.33089 6.37329C1.33089 9.24702 3.29323 11.4426 6.41346 11.4426C9.5337 11.4426 11.5866 9.34453 11.5866 6.37329C11.5866 3.40205 9.30339 1.35591 6.41346 1.35591Z"
                    fill="#7F8DA0"
                  />
                </svg>
              </button>
              <input
                type="text"
                className="comp inter14-400"
                placeholder="Поиск"
                // value={searchValue}
                // onChange={(e) => setSearchValue(e.target.value)}
                // onKeyDown={handleKeyDown}
              />
            </div>

            <div className="admin-cat_table admin-comp_table inter13-400">
              <div className="admin-cat_table-row admin-subcat_table-row admin-cat_table-head admin-comp_table-row">
                <div className="admin-cat_table-cell">Код</div>
                <div className="admin-cat_table-cell">Номенклатура</div>
                <div className="admin-cat_table-cell">Действия</div>
              </div>
              <div className="admin-cat_table-content">
                {products.map((item) => (
                  <div
                    className="admin-cat_table-row admin-subcat_table-row admin-cat_table-item admin-comp_table-row"
                    key={item.id}
                  >
                    <div className="admin-cat_table-cell">{item.article}</div>
                    <div className="admin-cat_table-cell">{item.title}</div>
                    <button
                      className="admin-nom_cat-select grey-btn inter14-600"
                      // onClick={() => handleAddToCategory(cat.id)}
                      // disabled={isLoading}
                    >
                      Назначить
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompilationsCreate;
