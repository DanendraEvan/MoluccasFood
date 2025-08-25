import InfoPageWrapper from "../../components/InfoPageWrapper";

const InfoPage4 = () => {
  return (
    <InfoPageWrapper prevPage="/info/3" nextPage="/info/5">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold">Info Halaman 4</h1>
        <p className="mt-4">Ini adalah halaman informasi yang keempat.</p>
      </div>
    </InfoPageWrapper>
  );
};

export default InfoPage4;