import InfoPageWrapper from "../../components/InfoPageWrapper";

const InfoPage3 = () => {
  return (
    <InfoPageWrapper prevPage="/info/2" nextPage="/info/4">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold">Info Halaman 3</h1>
        <p className="mt-4">Ini adalah halaman informasi yang ketiga.</p>
      </div>
    </InfoPageWrapper>
  );
};

export default InfoPage3;