import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./NomenclaturesLayout.scss";

interface NomenclaturesLayoutProps {
  children: React.ReactNode;
  onSearch: (searchTerm: string) => void;
  parentTitle?: string;
}

const NomenclaturesLayout: React.FC<NomenclaturesLayoutProps> = ({
  children,
  onSearch,
  parentTitle,
}) => {
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    onSearch(search);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="admin-nom">
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
        <Link to={"connections"} className="admin-nom_to-links">
          <span className="inter12-600">К существующим связям</span>
          <div className="admin-nom_to-links-icon">
            <svg
              width="11"
              height="9"
              viewBox="0 0 11 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.20819 4.25007L0.75 4.24992M6.58341 7.75006C6.58341 7.75006 10.0834 5.01863 10.0834 4.25004C10.0834 3.48144 6.58338 0.750061 6.58338 0.750061"
                stroke="#3D3D3C"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </Link>
      </div>

      <div className="admin-nom_head">
        <div className="admin-nom_head-main">
          {parentTitle && (
            <Link to="/admin/nomenclatures" className="admin-nom_back">
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
          )}
          <span className="admin-nom_head-info inter13-600">
            {parentTitle ||
              "Выберете номенклатуру чтобы назначить подкатегорию"}
          </span>
        </div>
        <div className="admin-nom_head-set">
          <span className="admin-nom_head-set-label inter13-400">
            Показывать только не назначенные
          </span>
        </div>
        <div className="admin-cat_search admin-nom_search">
          <input
            type="text"
            className="admin-nom_search-input inter13-400"
            placeholder="Номенклатура"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSearch}
          />
          <button
            className="admin-cat_search-icon"
            onClick={handleSearch}
            aria-label="Поиск"
          >
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
                d="M5.51154 0C8.55548 0 11.0231 2.45216 11.0231 5.47704C11.0231 6.72692 10.4875 8.0036 9.77837 8.92532L13.5068 12.628C13.772 12.9112 13.8356 13.2507 13.6213 13.536C13.4069 13.8213 12.8967 13.8213 12.5818 13.5362L8.85245 9.83351C7.92555 10.5365 6.76761 10.9541 5.51154 10.9541C2.4676 10.9541 0 8.50193 0 5.47704C0 2.45216 2.4676 0 5.51154 0ZM5.51041 1.16522C3.02688 1.16522 1.14258 3.00742 1.14258 5.47703C1.14258 7.94664 2.82896 9.8335 5.51041 9.8335C8.19186 9.8335 9.95609 8.03044 9.95609 5.47703C9.95609 2.92362 7.99395 1.16522 5.51041 1.16522Z"
                fill="#727271"
              />
            </svg>
          </button>
        </div>
      </div>

      {children}
    </div>
  );
};

export default NomenclaturesLayout;
