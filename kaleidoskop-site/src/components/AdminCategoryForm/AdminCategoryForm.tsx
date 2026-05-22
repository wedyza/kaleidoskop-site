import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  createAdminCategory,
  updateAdminCategory,
  fetchAdminCategories,
  fetchAdminCategoryById,
} from "../../features/admin/adminCategoriesSlice";
import "./AdminCategoryForm.scss";

interface AdminCategoryFormProps {
  type: "category" | "subcategory";
  mode: "create" | "edit";
}

const AdminCategoryForm: React.FC<AdminCategoryFormProps> = ({
  type,
  mode,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    categories,
    currentCategory,
    createLoading,
    updateLoading,
    currentCategoryLoading,
  } = useAppSelector((state) => state.adminCategories);

  const [formData, setFormData] = useState({
    title: "",
    active: true,
    imageFile: null as File | null,
    parent: "",
    existingImageName: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // const pageTitles = {
  //   category: {
  //     create: 'Создание категории',
  //     edit: 'Редактирование категории'
  //   },
  //   subcategory: {
  //     create: 'Создание подкатегории',
  //     edit: 'Редактирование подкатегории'
  //   }
  // };

  useEffect(() => {
    dispatch(fetchAdminCategories());
  }, [dispatch]);

  useEffect(() => {
    if (mode === "edit" && id) {
      dispatch(fetchAdminCategoryById(id));
    }
  }, [mode, id, dispatch]);

  useEffect(() => {
    if (mode === "edit" && currentCategory) {
      setFormData((prev) => ({
        ...prev,
        title: currentCategory.title,
        active: currentCategory.active,
        parent: currentCategory.parent || "",
        existingImageName: currentCategory.image || "",
      }));
    }
  }, [mode, currentCategory]);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setFormData((prev) => ({ ...prev, imageFile: null }));
      return;
    }

    const validTypes = ["image/svg+xml", "image/png"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: "Только SVG или PNG файлы" }));
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors((prev) => ({ ...prev, image: "Файл не должен превышать 2MB" }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      imageFile: file,
    }));

    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Название обязательно";
    }

    if (formData.title.length > 100) {
      newErrors.title = "Название должно быть не более 100 символов";
    }

    if (type === "subcategory" && !formData.parent) {
      newErrors.parent = "Выберите родительскую категорию";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = new FormData();

    data.append("title", formData.title);
    data.append("active", String(formData.active));

    if (type === "subcategory") {
      data.append("parent", formData.parent);
    } else {
      if (formData.parent) {
        data.append("parent", formData.parent);
      }
    }

    if (type === "category" && formData.imageFile) {
      data.append("image", formData.imageFile);
    }

    try {
      if (mode === "create") {
        await dispatch(createAdminCategory(data)).unwrap();
      }

      if (mode === "edit" && id) {
        await dispatch(updateAdminCategory({ id, data })).unwrap();
      }

      navigate("/admin/categories");
    } catch (error) {
      console.error("Ошибка сохранения:", error);
    }
  };
  const parentCategories = categories.filter((cat) => !cat.parent);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const selectedParent = parentCategories.find(
    (cat) => cat.id === formData.parent,
  );

  const removeImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, imageFile: null }));
  };

  const selectParentCategory = (parentId: string) => {
    setFormData((prev) => ({ ...prev, parent: parentId }));
    setIsDropdownOpen(false);
    if (errors.parent) {
      setErrors((prev) => ({ ...prev, parent: "" }));
    }
  };

  const isLoading = currentCategoryLoading || createLoading || updateLoading;

  return (
    <div className="admin-category-form">
      <div className="admin-head">
        <div className="admin-head_icon">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M8.89927 6.4762C9.16753 6.4762 9.38499 6.69366 9.38499 6.96191V8.41905H10.8421C11.1104 8.41905 11.3278 8.63652 11.3278 8.90477C11.3278 9.17302 11.1104 9.39048 10.8421 9.39048H9.38499V10.8476C9.38499 11.1159 9.16753 11.3333 8.89927 11.3333C8.63102 11.3333 8.41356 11.1159 8.41356 10.8476V9.39048H6.95642C6.68816 9.39048 6.4707 9.17302 6.4707 8.90477C6.4707 8.63652 6.68816 8.41905 6.95642 8.41905H8.41356V6.96191C8.41356 6.69366 8.63102 6.4762 8.89927 6.4762Z"
              fill="#454545"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M0.971429 0.971429V3.88571H3.88571V0.971429H0.971429ZM0 0.874286C0 0.391431 0.391431 0 0.874286 0H3.98286C4.46571 0 4.85714 0.391431 4.85714 0.874286V3.98286C4.85714 4.46571 4.46571 4.85714 3.98286 4.85714H0.874286C0.391431 4.85714 0 4.46571 0 3.98286V0.874286Z"
              fill="#454545"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M0.971429 7.44762V10.3619H3.88571V7.44762H0.971429ZM0 7.35048C0 6.86763 0.391431 6.4762 0.874286 6.4762H3.98286C4.46571 6.4762 4.85714 6.86763 4.85714 7.35048V10.4591C4.85714 10.9419 4.46571 11.3333 3.98286 11.3333H0.874286C0.391431 11.3333 0 10.9419 0 10.4591V7.35048Z"
              fill="#454545"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M7.44799 0.971429V3.88571H10.3623V0.971429H7.44799ZM6.47656 0.874286C6.47656 0.391431 6.86799 0 7.35085 0H10.4594C10.9423 0 11.3337 0.391431 11.3337 0.874286V3.98286C11.3337 4.46571 10.9423 4.85714 10.4594 4.85714H7.35085C6.86799 4.85714 6.47656 4.46571 6.47656 3.98286V0.874286Z"
              fill="#454545"
            />
          </svg>
        </div>
        <h1 className="admin-head_title inter16-600">Управление категориями</h1>
      </div>
      {/* 
      <div className="admin-head">
        <div className="admin-head_icon">
        </div>
        <div className="admin-head_title inter16-600">
          {pageTitles[type][mode]}
        </div>
      </div> */}

      <div className="cat-form_head">
        <Link to="/admin/categories" className="cat-form_back">
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
            {formData.title || "Название категории"}
          </div>
          <div className="cat-form_info-acts">
            <button
              className="cat-form_save accent-btn inter12-600"
              onClick={handleSubmit}
            >
              {mode === "create" ? "Создать" : "Сохранить изменения"}
            </button>
          </div>
        </div>
      </div>

      <div className="cat-form_main">
        <div className="cat-form_main-info">
          <h2 className="cat-form_title inter16-600">
            Создайте {type === "category" ? "категорию" : "подкатегорию"}
          </h2>
          <p className="cat-form_desc inter14-400">
            {type === "category"
              ? "Чтобы создать категорию, введите её название и загрузите иконку"
              : "Чтобы создать подкатегорию, введите её название и выберите родительскую категорию"}
          </p>
        </div>
        <form className="category-form">
          <div className="category-form_group">
            <label className="category-form_label inter13-400">
              Название {type === "category" ? "категории" : "подкатегории"}
            </label>
            <div className="category-form_input">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTextChange}
                className={`inter14-400`}
                placeholder={`Название ${type === "category" ? "категории" : "подкатегории"}`}
                maxLength={100}
                disabled={isLoading}
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
            {errors.title && (
              <span className="category_error-message">{errors.title}</span>
            )}
          </div>

          {type === "category" && (
            <div className="category-form_group">
              <label className="category-form_label inter13-400">
                Загрузить иконку
              </label>

              {!formData.imageFile &&
              formData.existingImageName &&
              mode === "edit" ? (
                <div className="category-form_file-selected">
                  <div className="category-form_file-selected-icon">
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
                        d="M13.5 13.5V2.5H2.5V13.5H13.5ZM14.5 13.6C14.5 14.0971 14.0971 14.5 13.6 14.5H2.4C1.90294 14.5 1.5 14.0971 1.5 13.6V2.4C1.5 1.90294 1.90294 1.5 2.4 1.5H13.6C14.0971 1.5 14.5 1.90294 14.5 2.4V13.6Z"
                        fill="#161616"
                      />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M6.46984 8.20705C6.59908 8.15166 6.74568 8.15325 6.8737 8.21144L14.207 11.5448C14.4584 11.659 14.5696 11.9555 14.4553 12.2069C14.341 12.4582 14.0446 12.5694 13.7932 12.4551L6.66086 9.21315L2.19709 11.1262C1.94327 11.235 1.64933 11.1174 1.54056 10.8636C1.43178 10.6098 1.54935 10.3158 1.80317 10.207L6.46984 8.20705Z"
                        fill="#161616"
                      />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M10.6667 4.5C11.1269 4.5 11.5 4.8731 11.5 5.33333C11.5 5.79357 11.1269 6.16667 10.6667 6.16667C10.2064 6.16667 9.83333 5.79357 9.83333 5.33333C9.83333 4.8731 10.2064 4.5 10.6667 4.5ZM12.5 5.33333C12.5 4.32081 11.6792 3.5 10.6667 3.5C9.65414 3.5 8.83333 4.32081 8.83333 5.33333C8.83333 6.34586 9.65414 7.16667 10.6667 7.16667C11.6792 7.16667 12.5 6.34586 12.5 5.33333Z"
                        fill="#161616"
                      />
                    </svg>
                  </div>
                  <span className="category-form_file-name inter13-400">
                    {
                      formData.existingImageName
                        .split("?")[0]
                        .split("categories/")[1]
                    }
                  </span>
                  <div className="category-form_file-actions">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFormData((prev) => ({
                          ...prev,
                          existingImageName: "",
                          imageFile: null,
                        }));
                      }}
                      className="category-form_file-remove"
                      disabled={isLoading}
                      aria-label="Удалить"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M0.220236 0.219705C0.513129 -0.0731876 0.988003 -0.0731878 1.2809 0.219705L5.99321 4.93202L10.7055 0.219705C10.9984 -0.0731876 11.4733 -0.0731879 11.7662 0.219705C12.0591 0.512598 12.0591 0.987473 11.7662 1.28037L7.05387 5.99268L11.7662 10.705C12.0591 10.9979 12.0591 11.4728 11.7662 11.7656C11.4733 12.0585 10.9984 12.0585 10.7055 11.7656L5.99321 7.05334L1.2809 11.7656C0.988003 12.0585 0.513129 12.0585 0.220236 11.7656C-0.0726573 11.4728 -0.0726572 10.9979 0.220236 10.705L4.93255 5.99268L0.220236 1.28037C-0.0726572 0.987472 -0.0726573 0.512599 0.220236 0.219705Z"
                          fill="#B0B0B0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : !formData.imageFile ? (
                <div className="category-form_file-upload inter14-600">
                  <input
                    type="file"
                    accept=".svg,.png"
                    onChange={handleImageChange}
                    className="category-form_file-input"
                    disabled={isLoading}
                    id="image-upload"
                  />
                  <div className="category-form_file-upload-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M4.375 16.6666C4.375 16.3214 4.65482 16.0416 5 16.0416L15 16.0416C15.3452 16.0416 15.625 16.3214 15.625 16.6666C15.625 17.0118 15.3452 17.2916 15 17.2916L5 17.2916C4.65482 17.2916 4.375 17.0118 4.375 16.6666Z"
                        fill="#454545"
                      />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M9.55871 2.89143C9.80279 2.64735 10.1985 2.64735 10.4426 2.89143L13.3593 5.8081C13.6033 6.05218 13.6033 6.4479 13.3593 6.69198C13.1152 6.93606 12.7195 6.93606 12.4754 6.69198L10.6257 4.84226V13.3334C10.6257 13.6786 10.3458 13.9584 10.0007 13.9584C9.65547 13.9584 9.37565 13.6786 9.37565 13.3334V4.84226L7.52593 6.69198C7.28185 6.93606 6.88612 6.93606 6.64204 6.69198C6.39796 6.4479 6.39796 6.05218 6.64204 5.8081L9.55871 2.89143Z"
                        fill="#454545"
                      />
                    </svg>
                  </div>
                  <label
                    htmlFor="image-upload"
                    className="category-form_file-btn"
                  >
                    Загрузить
                  </label>
                </div>
              ) : (
                <div className="category-form_file-selected">
                  <div className="category-form_file-selected-icon">
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
                        d="M13.5 13.5V2.5H2.5V13.5H13.5ZM14.5 13.6C14.5 14.0971 14.0971 14.5 13.6 14.5H2.4C1.90294 14.5 1.5 14.0971 1.5 13.6V2.4C1.5 1.90294 1.90294 1.5 2.4 1.5H13.6C14.0971 1.5 14.5 1.90294 14.5 2.4V13.6Z"
                        fill="#161616"
                      />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M6.46984 8.20705C6.59908 8.15166 6.74568 8.15325 6.8737 8.21144L14.207 11.5448C14.4584 11.659 14.5696 11.9555 14.4553 12.2069C14.341 12.4582 14.0446 12.5694 13.7932 12.4551L6.66086 9.21315L2.19709 11.1262C1.94327 11.235 1.64933 11.1174 1.54056 10.8636C1.43178 10.6098 1.54935 10.3158 1.80317 10.207L6.46984 8.20705Z"
                        fill="#161616"
                      />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M10.6667 4.5C11.1269 4.5 11.5 4.8731 11.5 5.33333C11.5 5.79357 11.1269 6.16667 10.6667 6.16667C10.2064 6.16667 9.83333 5.79357 9.83333 5.33333C9.83333 4.8731 10.2064 4.5 10.6667 4.5ZM12.5 5.33333C12.5 4.32081 11.6792 3.5 10.6667 3.5C9.65414 3.5 8.83333 4.32081 8.83333 5.33333C8.83333 6.34586 9.65414 7.16667 10.6667 7.16667C11.6792 7.16667 12.5 6.34586 12.5 5.33333Z"
                        fill="#161616"
                      />
                    </svg>
                  </div>
                  <span className="category-form_file-name inter13-400">
                    {formData.imageFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="category-form_file-remove"
                    disabled={isLoading}
                    aria-label="Удалить"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M0.220236 0.219705C0.513129 -0.0731876 0.988003 -0.0731878 1.2809 0.219705L5.99321 4.93202L10.7055 0.219705C10.9984 -0.0731876 11.4733 -0.0731879 11.7662 0.219705C12.0591 0.512598 12.0591 0.987473 11.7662 1.28037L7.05387 5.99268L11.7662 10.705C12.0591 10.9979 12.0591 11.4728 11.7662 11.7656C11.4733 12.0585 10.9984 12.0585 10.7055 11.7656L5.99321 7.05334L1.2809 11.7656C0.988003 12.0585 0.513129 12.0585 0.220236 11.7656C-0.0726573 11.4728 -0.0726572 10.9979 0.220236 10.705L4.93255 5.99268L0.220236 1.28037C-0.0726572 0.987472 -0.0726573 0.512599 0.220236 0.219705Z"
                        fill="#B0B0B0"
                      />
                    </svg>
                  </button>
                </div>
              )}
              {errors.image && (
                <span className="category_error-message">{errors.image}</span>
              )}
            </div>
          )}

          {type === "subcategory" && (
            <div className="category-form_group">
              <label className="category-form_label inter13-400">
                Родительская категория
              </label>
              <div className="category-form_dropdown">
                <div
                  className={`inter14-600 category-form_dropdown-select ${isDropdownOpen ? "category-form_dropdown-select--open" : ""}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {selectedParent ? selectedParent.title : "Категория"}
                  <svg
                    width="10"
                    height="5"
                    viewBox="0 0 10 5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.70926 0.121783C10.0269 0.32648 10.0947 0.71773 9.8608 0.995663C9.6791 1.21154 9.49735 1.41675 9.33795 1.59548C9.01973 1.95228 8.58165 2.43011 8.10569 2.90977C7.63282 3.38633 7.10851 3.87899 6.61903 4.25743C6.3751 4.44602 6.123 4.61945 5.87717 4.74913C5.65095 4.86846 5.3401 5 5.00001 5C4.65993 5 4.34905 4.86846 4.12283 4.74913C3.877 4.61945 3.6249 4.44602 3.38097 4.25743C2.89149 3.87899 2.36718 3.38633 1.89431 2.90977C1.41835 2.43011 0.98027 1.95228 0.662049 1.59548C0.502644 1.41675 0.3209 1.21154 0.139195 0.995664C-0.0947401 0.71773 -0.02689 0.326481 0.290743 0.121784C0.418425 0.0394992 0.567039 -0.00010783 0.71432 4.0589e-07L5 2.18557e-07L9.28568 3.12239e-08C9.43296 -0.000108217 9.58157 0.0394988 9.70926 0.121783Z"
                      fill="#4F4F4F"
                    />
                  </svg>
                </div>

                {isDropdownOpen && (
                  <div className="category-form_dropdown-list inter14-400">
                    {parentCategories.length === 0 ? (
                      <div className="category-form_dropdown-empty">
                        Нет доступных категорий
                      </div>
                    ) : (
                      parentCategories.map((cat) => (
                        <div
                          key={cat.id}
                          className={`category-form_dropdown-item ${formData.parent === cat.id ? "category-form_dropdown-item--selected" : ""}`}
                          onClick={() => selectParentCategory(cat.id)}
                        >
                          {cat.title}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {errors.parent && (
                <span className="category_error-message">{errors.parent}</span>
              )}
            </div>
          )}

          {/* <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleTextChange}
                disabled={isLoading}
              />
              <span className="checkbox-text inter14-600">Активна</span>
            </label>
          </div> */}
        </form>
      </div>
    </div>
  );
};

export default AdminCategoryForm;
