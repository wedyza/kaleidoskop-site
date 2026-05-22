import { useEffect, useRef, useState } from "react";
import "./AddressPicker.scss";
import { ymapsApi } from "../../api/yandexApi";

interface AddressPickerProps {
  value?: string;
  addressDetails?: {
    apartment?: string;
    entrance?: string;
    floor?: string;
    intercom?: string;
  };
  onChange?: (address: string, coords: [number, number]) => void;
  onDetailsChange?: (details: {
    apartment: string;
    entrance: string;
    floor: string;
    intercom: string;
  }) => void;
  isOpen?: boolean;
  onSave?: () => void;
}

const AddressPicker: React.FC<AddressPickerProps> = ({
  value = "",
  addressDetails,
  onChange,
  onDetailsChange,
  isOpen = true,
  onSave,
}) => {
  const [address, setAddress] = useState(value);
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const [details, setDetails] = useState({
    apartment: addressDetails?.apartment || "",
    entrance: addressDetails?.entrance || "",
    floor: addressDetails?.floor || "",
    intercom: addressDetails?.intercom || "",
  });

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const placemark = useRef<any>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (addressDetails) {
      setDetails({
        apartment: addressDetails.apartment || "",
        entrance: addressDetails.entrance || "",
        floor: addressDetails.floor || "",
        intercom: addressDetails.intercom || "",
      });
    }
  }, [addressDetails]);

  useEffect(() => {
    if (!isOpen) return;

    const scriptId = "ymaps-script";

    if (!scriptLoaded.current) {
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${import.meta.env.VITE_YMAPS_API_KEY}&lang=ru_RU`;
        script.onload = () => {
          scriptLoaded.current = true;
          window.ymaps.ready(() => {
            setIsMapReady(true);
            initMap();
          });
        };
        document.body.appendChild(script);
      } else {
        scriptLoaded.current = true;
        window.ymaps.ready(() => {
          setIsMapReady(true);
          initMap();
        });
      }
    } else if (isMapReady) {
      initMap();
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, [isOpen, isMapReady]);

  const initMap = () => {
    if (!mapRef.current || mapInstance.current || !isOpen) return;

    mapInstance.current = new window.ymaps.Map(mapRef.current, {
      center: [58.632513, 59.81863],
      zoom: 13,
      controls: ["zoomControl", "fullscreenControl"],
    });

    placemark.current = new window.ymaps.Placemark(
      mapInstance.current.getCenter(),
      {},
      {
        draggable: true,
        preset: "islands#redDotIcon",
      },
    );

    mapInstance.current.geoObjects.add(placemark.current);

    mapInstance.current.events.add("click", async (e: any) => {
      const newCoords = e.get("coords");
      updateCoords(newCoords);
    });

    placemark.current.events.add("dragend", async () => {
      const newCoords = placemark.current.geometry.getCoordinates();
      updateCoords(newCoords);
    });

    if (value && coords) {
      placemark.current.geometry.setCoordinates(coords);
      mapInstance.current.setCenter(coords);
    }
  };

  const updateCoords = async (newCoords: [number, number]) => {
    setCoords(newCoords);
    placemark.current.geometry.setCoordinates(newCoords);

    const addr = await reverseGeocode(newCoords);
    setAddress(addr);
    onChange?.(addr, newCoords);
  };

  const handleDetailChange = (field: keyof typeof details, value: string) => {
    const newDetails = {
      ...details,
      [field]: value,
    };
    setDetails(newDetails);
    onDetailsChange?.(newDetails);
  };

  const handleDetailBlur = (_field: keyof typeof details) => {
    onDetailsChange?.(details);
  };

  const geocodeAddress = async (addr: string) => {
    try {
      const response = await ymapsApi.get("", {
        params: { geocode: addr, format: "json", results: 1 },
      });

      const point =
        response.data.response.GeoObjectCollection.featureMember[0]?.GeoObject
          ?.Point?.pos;

      if (!point) return null;

      const [lon, lat] = point.split(" ").map(Number);
      return [lat, lon] as [number, number];
    } catch {
      return null;
    }
  };

  const reverseGeocode = async (coords: [number, number]) => {
    try {
      const response = await ymapsApi.get("", {
        params: {
          geocode: `${coords[1]},${coords[0]}`,
          format: "json",
          kind: "house",
        },
      });

      return (
        response.data.response.GeoObjectCollection.featureMember[0]?.GeoObject
          ?.metaDataProperty?.GeocoderMetaData?.text || ""
      );
    } catch {
      return "";
    }
  };

  const handleBlur = async () => {
    if (!address.trim()) return;

    const result = await geocodeAddress(address.trim());
    if (!result) return;

    updateCoords(result);
    mapInstance.current?.setCenter(result);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  return (
    <div className="address-picker">
      <div className="address-input-wrapper">
        <input
          className="address-picker_input inter13-400"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          placeholder="Введите адрес или выберите на карте"
        />
      </div>

      <div className="address-grid">
        <div className="address_main-grid">
          <div className="address_details-grid">
            <div className="address_detail-field">
              <label className="inter14-400">Квартира</label>
              <input
                type="text"
                className="address_detail-input inter16-400"
                value={details.apartment}
                onChange={(e) =>
                  handleDetailChange("apartment", e.target.value)
                }
                onBlur={() => handleDetailBlur("apartment")}
                placeholder="Номер квартиры"
              />
            </div>

            <div className="address_detail-field">
              <label className="inter14-400">Подъезд</label>
              <input
                type="text"
                className="address_detail-input inter16-400"
                value={details.entrance}
                onChange={(e) => handleDetailChange("entrance", e.target.value)}
                onBlur={() => handleDetailBlur("entrance")}
                placeholder="Номер подъезда"
              />
            </div>

            <div className="address_detail-field">
              <label className="inter14-400">Этаж</label>
              <input
                type="text"
                className="address_detail-input inter16-400"
                value={details.floor}
                onChange={(e) => handleDetailChange("floor", e.target.value)}
                onBlur={() => handleDetailBlur("floor")}
                placeholder="Этаж"
              />
            </div>

            <div className="address_detail-field">
              <label className="inter14-400">Домофон</label>
              <input
                type="text"
                className="address_detail-input inter16-400"
                value={details.intercom}
                onChange={(e) => handleDetailChange("intercom", e.target.value)}
                onBlur={() => handleDetailBlur("intercom")}
                placeholder="Код домофона"
              />
            </div>
          </div>

          <button
            className="address-modal_save accent-btn inter14-600"
            onClick={onSave}
          >
            Сохранить
          </button>
        </div>

        <div
          ref={mapRef}
          className={`address-picker_map ${!isMapReady ? "address-picker_map--loading" : ""}`}
        >
          {!isMapReady && <div className="map-loading">Загрузка карты...</div>}
        </div>
      </div>
    </div>
  );
};

export default AddressPicker;
