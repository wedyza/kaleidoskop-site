import type React from "react";
import type { ProductParameters } from "../../features/products/productsSlice";
import "./MainParameters.scss";

interface MainParametersProps {
  params: ProductParameters[];
}

const MainParameters: React.FC<MainParametersProps> = ({ params }) => {
  return (
    <div className="params-main">
      <div className="params-main_list inter14-400">
        {params.map((param, i) => (
          <div className="params-main_item" key={i}>
            <div className="params-main_item-label_cont">
              <span className="params-main_item-text params-main_item-label">
                {param.parameter.title}:
              </span>
            </div>
            <span className="params-main_item-text params-main_item-value">
              {param.value} {param.parameter.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainParameters;
