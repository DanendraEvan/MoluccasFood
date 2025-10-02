import dynamic from 'next/dynamic';

const GameIndex = dynamic(() => import('../../components/GameIndex'), { ssr: false });

const Page = () => {
    return <GameIndex />;
}

export default Page;