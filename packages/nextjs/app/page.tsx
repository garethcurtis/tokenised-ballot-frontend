"use client";

import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { useSignMessage } from "wagmi";
import { useState } from "react";
import { useEffect } from "react";
import { useBalance } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address, formatUnits } from "viem";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">TOKENISED BALLOT</span>
            <PageBody></PageBody>
          </h1>
        </div>
      </div>
    </>
  );
};

function PageBody() {
  return (
    <>
      <WalletInfo></WalletInfo>
      <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Results:</h2>
        <QueryWinningProposal></QueryWinningProposal>
        <QueryWinnerName></QueryWinnerName>
      </div>
    </div>
    </>
  );
}

export default Home;

function WalletInfo() {
  const { address, isConnecting, isDisconnected, chain } = useAccount();
  if (address)
    return (
      <div>
        <p>Your account address is {address}</p>
        <p>Connected to the network {chain?.name}</p>
        <WalletBalance address={address as `0x${string}`}></WalletBalance>
        <ApiData address={address as `0x${string}`}></ApiData>
      </div>
    );
  if (isConnecting)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (isDisconnected)
    return (
      <div>
        <p>Wallet disconnected. Connect wallet to continue</p>
      </div>
    );
  return (
    <div>
      <p>Connect wallet to continue</p>
    </div>
  );
}

function WalletBalance(params: { address: Address }) {
  const { data, isError, isLoading } = useBalance({
    address: params.address,
  });

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Your balance: {data?.value ? Number(formatUnits(data.value, data.decimals)).toFixed(2) : '0'} {data?.symbol}</h2>
      </div>
    </div>
  );
}

function ApiData(params: { address: `0x${string}` }) {
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Mint the <TokenNameFromApi></TokenNameFromApi> tokens here:</h2>
        <RequestTokens address={params.address}></RequestTokens>
      </div>
    </div>
  );
}

function TokenNameFromApi() {
  const [data, setData] = useState<{ result: string }>();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/token-name")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading token name from API...</p>;
  if (!data) return <p>No token name found</p>;

  return data.result;
}

function RequestTokens(params: { address: string }) {
  const [data, setData] = useState<{ result: { hash: string }}>();
  const [isLoading, setLoading] = useState(false);

  const body = { address: params.address };

  if (isLoading) return <p>Requesting tokens from API...</p>;
  if (!data)
    return (
      <button
        className="btn btn-active btn-neutral"
        onClick={() => {
          setLoading(true);
          fetch("http://localhost:3001/mint-tokens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
            .then((res) => res.json())
            .then((data) => {
              setData(data);
              setLoading(false);
            });
        }}
      >
        Request tokens from API
      </button>
    );
  return (
    <div>
      <p>{data.result ? "Mint successful!" : "Minting failed!"}</p>
      <p>Transaction hash:</p>
      <p>{data.result ? data.result.hash : "No transaction hash available"}</p>
    </div>
  );
}

function QueryWinningProposal() {
  const { data, isError, isLoading } = useReadContract({
    address: '0x630a3b0cba8ee5de3b02df1fa7e3a587ebb9f1d7',
    abi: [
      {
        "inputs": [],
        "name": "winningProposal",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "winningProposal",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
    ],
    functionName: "winningProposal",
  });

  const name = typeof data === "string" ? data : 0;

  if (isLoading) return <div>Fetching winning proposal</div>;
  if (isError) return <div>Error fetching winning proposal</div>;
  return <div>Winning proposal: {name}</div>;
}

function QueryWinnerName() {
  const { data, isError, isLoading } = useReadContract({
    address: '0x630a3b0cba8ee5de3b02df1fa7e3a587ebb9f1d7',
    abi: [
      {
        "inputs": [],
        "name": "winnerName",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "winnerName",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
    ],
    functionName: "winnerName",
  });

  const name = typeof data === "string" ? data : 0;

  if (isLoading) return <div>Fetching winner name</div>;
  if (isError) return <div>Error fetching winner name</div>;
  return <div>Winning name: {name}</div>;
}
