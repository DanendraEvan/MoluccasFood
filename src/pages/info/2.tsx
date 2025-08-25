import InfoPageWrapper from "../../components/InfoPageWrapper";

const InfoPage2 = () => {
  return (
    <InfoPageWrapper prevPage="/info/1" nextPage="/info/3">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold">Info Halaman 2</h1>
        <p className="mt-4">Ini adalah halaman informasi yang kedua.</p>
      </div>
    </InfoPageWrapper>
  );
};

export default InfoPage2;