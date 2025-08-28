import InfoPageWrapper from "../../components/InfoPageWrapper";

const InfoPage1 = () => {
  return (
    <InfoPageWrapper nextPage="/info/2">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold">Info Halaman 1</h1>
        <p className="mt-4">Ini adalah halaman informasi yang pertama.</p>
      </div>
    </InfoPageWrapper>
  );
};

export default InfoPage1;