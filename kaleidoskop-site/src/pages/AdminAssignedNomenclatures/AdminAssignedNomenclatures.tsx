import { Link } from "react-router-dom";
import "./AdminAssignedNomenclatures.scss";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useEffect, useState } from "react";
import {
  fetchAdminNomenclatures,
  type Nomenclature,
} from "../../features/admin/nomenclaturesSlice";
import NomenclaturesModal from "../../components/NomenclaturesModal/NomenclaturesModal";

const AdminAssignedNomenclatures = () => {
  const nomenclatures = useAppSelector(
    (state) => state.nomenclatures.nomenclatures,
  );
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedNom, setSelectedNom] = useState<Nomenclature | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (selectedNom?.id) {
      const updatedNom = nomenclatures.find((n) => n.id === selectedNom.id);
      if (updatedNom) {
        setSelectedNom(updatedNom);
      }
    }
  }, [nomenclatures, selectedNom?.id]);

  useEffect(() => {
    dispatch(fetchAdminNomenclatures({ assigned: true }));
  }, [dispatch]);

  const handleSearch = () => {
    if (search.trim()) {
      dispatch(
        fetchAdminNomenclatures({ search: search.trim(), assigned: true }),
      );
    } else {
      dispatch(fetchAdminNomenclatures({ assigned: true }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="admin-links">
      <div className="admin-head">
        <div className="admin-head_icon">
          <svg
            width="11"
            height="11"
            viewBox="0 0 11 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M-4.60499e-08 0.625001C-2.06172e-08 0.279822 0.265313 2.75207e-08 0.592593 6.14692e-08L10.0741 1.04498e-06C10.4014 1.07893e-06 10.6667 0.279823 10.6667 0.625002C10.6667 0.97018 10.4014 1.25 10.0741 1.25L0.592593 1.25C0.265313 1.25 -7.14825e-08 0.970179 -4.60499e-08 0.625001Z"
              fill="#454545"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M-4.60499e-08 5C-2.06172e-08 4.65482 0.265313 4.375 0.592593 4.375L10.0741 4.375C10.4014 4.375 10.6667 4.65482 10.6667 5C10.6667 5.34518 10.4014 5.625 10.0741 5.625L0.592593 5.625C0.265313 5.625 -7.14825e-08 5.34518 -4.60499e-08 5Z"
              fill="#454545"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M-4.60499e-08 9.375C-2.06172e-08 9.02982 0.265313 8.75 0.592593 8.75L10.0741 8.75C10.4014 8.75 10.6667 9.02982 10.6667 9.375C10.6667 9.72018 10.4014 10 10.0741 10L0.592593 10C0.265313 10 -7.14825e-08 9.72018 -4.60499e-08 9.375Z"
              fill="#454545"
            />
          </svg>
        </div>
        <h1 className="admin-head_title inter16-600">
          Номенклатуры и категории
        </h1>
      </div>

      <div className="admin-links_head">
        <Link to={"/admin/nomenclatures"} className="admin-links_back">
          <div className="admin-links_back-icon">
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
          <span className="inter13-500">Назад</span>
        </Link>
        <h2 className="inter13-600 admin-links_title">Существующие связи</h2>
      </div>

      <div className="admin-links_content">
        <div className="admin-links_set admin-links_card">
          <div className="admin-links_search">
            <button
              className="admin-links_search-icon"
              onClick={handleSearch}
              aria-label="Поиск"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 11 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M4.27562 0C6.63698 0 8.55124 1.90228 8.55124 4.24886C8.55124 5.21846 8.13579 6.20885 7.58565 6.92388L10.478 9.79628C10.6837 10.016 10.7331 10.2793 10.5668 10.5006C10.4005 10.722 10.0047 10.722 9.76042 10.5008L6.86736 7.62842C6.1483 8.1738 5.25003 8.49772 4.27562 8.49772C1.91426 8.49772 0 6.59544 0 4.24886C0 1.90228 1.91426 0 4.27562 0ZM4.2751 0.903931C2.34848 0.903931 0.886719 2.33303 0.886719 4.24885C0.886719 6.16467 2.19494 7.62841 4.2751 7.62841C6.35525 7.62841 7.72387 6.22968 7.72387 4.24885C7.72387 2.26802 6.20172 0.903931 4.2751 0.903931Z"
                  fill="#727271"
                />
              </svg>
            </button>
            <input
              type="text"
              className="admin-links_search-input inter11-400"
              placeholder="Номенклатура"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="admin-links_sort">
            <span className="admin-links_sort-title inter12-600">
              Сортировать по:
            </span>
            <div className="admin-links_sort-list inter11-400">
              <div className="admin-links_sort-opt">Без сортировки</div>
              <div className="admin-links_sort-opt">Дате назначения</div>
            </div>
          </div>
        </div>

        <div className="admin-links_card admin-links_noms">
          <div className="admin-links_table">
            <div className="admin-links_table-head admin-links_table-row inter13-400">
              <span className="admin-links_table-cell">Подкатегория</span>
              <span className="admin-links_table-cell">Номенклатура</span>
              <span className="admin-links_table-cell">Код</span>
              <span className="admin-links_table-cell">Дата назначения</span>
              <span className="admin-links_table-cell">Действия</span>
            </div>
            <div className="admin-links_table-content">
              {nomenclatures.map((nom) => (
                <div className="admin-links_table-row admin-links_row inter13-400">
                  <span className="admin-links_table-cell">
                    {nom.categories.length > 0
                      ? nom.categories.map((cat) => cat.title).join(", ")
                      : "- нет"}
                  </span>
                  <span className="admin-links_table-cell">{nom.title}</span>
                  <span className="admin-links_table-cell">{nom.code}</span>
                  <span className="admin-links_table-cell">пупупу</span>
                  <span className="admin-links_table-cell">
                    <button
                      className="admin-nom_table-link admin-nom_table-link-subcat accent-btn"
                      onClick={() => {
                        setIsModalOpen(true);
                        setSelectedNom(nom);
                      }}
                    >
                      Изменить подкатегорию
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && selectedNom && (
        <NomenclaturesModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          selectedNom={selectedNom}
        />
      )}
    </div>
  );
};

export default AdminAssignedNomenclatures;
