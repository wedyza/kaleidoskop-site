import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import "./ShopsPicker.scss";

interface ShopsPickerProps {
  onSelectStore?: (store: any) => void;
  selectedStoreId?: string | null;
}

const ShopsPicker: React.FC<ShopsPickerProps> = ({ 
  onSelectStore, 
  selectedStoreId 
}) => {
  const shops = useAppSelector((state) => state.shops.shops);

  const [selectedShop, setSelectedShop] = useState<string | null>(
    selectedStoreId || null
  );

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const placemarks = useRef<Record<string, any>>({});

  useEffect(() => {
    if (selectedStoreId) {
      setSelectedShop(selectedStoreId);
    }
  }, [selectedStoreId]);

  useEffect(() => {
    const scriptId = "ymaps-script";

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${import.meta.env.VITE_YMAPS_API_KEY}&lang=ru_RU`;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  const initMap = () => {
    if (!window.ymaps || !mapRef.current || mapInstance.current) return;

    window.ymaps.ready(() => {
      mapInstance.current = new window.ymaps.Map(mapRef.current, {
        center: [58.632513, 59.818630],
        zoom: 13,
        controls: ['zoomControl', 'fullscreenControl']
      });

      renderShopsOnMap(selectedShop ?? undefined);
    });
  };

  const renderShopsOnMap = (activeId?: string) => {
    if (!mapInstance.current || !window.ymaps) return;

    mapInstance.current.geoObjects.removeAll();
    placemarks.current = {};

    shops.forEach((shop) => {
      const coords: [number, number] = [
        Number(shop.longtitude),
        Number(shop.latitude),
      ];

      const placemark = new window.ymaps.Placemark(
        coords,
        { balloonContent: shop.title },
        {
          preset:
            activeId === shop.id ? "islands#redIcon" : "islands#blueIcon",
        }
      );

      placemark.events.add("click", () => handleSelect(shop.id));

      placemarks.current[shop.id] = placemark;
      mapInstance.current.geoObjects.add(placemark);
    });
  };

  const handleSelect = (id: string) => {
    setSelectedShop(id);

    const shop = shops.find((s) => s.id === id);
    if (!shop) return;

    const coords: [number, number] = [
      Number(shop.longtitude),
      Number(shop.latitude),
    ];

    mapInstance.current?.setCenter(coords, 14, { duration: 300 });

    renderShopsOnMap(id);

    if (onSelectStore) {
      onSelectStore(shop);
    }
  };

  useEffect(() => {
    if (mapInstance.current && shops.length > 0) {
      renderShopsOnMap(selectedShop ?? undefined);
    }
  }, [shops, selectedShop]);


  return (
    <div className="store-picker">
      <div className="store-list">

        {shops.map((shop) => (
          <div
            key={shop.id}
            className={`store-card ${
              selectedShop === shop.id ? "active" : ""
            }`}
          >
            <div className="store-address inter16-400">
              {shop.city}, {shop.street}, {shop.house}
            </div>
            <div className="store-title inter14-400">{shop.title}</div>

            <button
              className="store-select-btn grey-btn inter14-600"
              onClick={() => handleSelect(shop.id)}
            >
              Выбрать
            </button>
          </div>
        ))}
      </div>

      <div className="store-map">
        <div ref={mapRef} className="store-map__container" />
      </div>
    </div>
  );
};

export default ShopsPicker;
