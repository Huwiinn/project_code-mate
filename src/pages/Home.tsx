import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import Pagination from "../components/comment/Paging";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { dbService } from "../shared/firebase";
import MainCategory from "../components/main/MainCategory";
import PostList from "../components/main/PostList";
import { useFirestoreQuery } from "@react-query-firebase/firestore";
import { PostState } from "../shared/type";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState<PostState[]>([]);
  const [category, setCategory] = useState("");
  const navigate = useNavigate();
  const authService = getAuth();
  const uid = authService.currentUser?.uid;
  // post 데이터에서 createAt을 내림차순으로 정렬
  const q = query(collection(dbService, "post"), orderBy("createdAt", "desc"));

  const getTimegap = (posting: number) => {
    const msgap = Date.now() - posting;
    const minutegap = Math.floor(msgap / 60000);
    const hourgap = Math.floor(msgap / 3600000);
    const daygap = Math.floor(msgap / 86400000);
    if (msgap < 0) {
      return "0분전";
    }
    if (daygap > 7) {
      const time = new Date(posting);
      const timegap = time.toJSON().substring(0, 10);
      return <p>{timegap}</p>;
    }
    if (hourgap > 24) {
      return <p>{daygap}일 전</p>;
    }
    if (minutegap > 59) {
      return <p>{hourgap}시간 전</p>;
    } else {
      return <p>{minutegap}분 전</p>;
    }
  };
  const getPost = () => {
    onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map((doc) => {
        // console.log('doc', doc.data());
        const newPost = {
          id: doc.id,
          ...doc.data(), // <- poststate
          createdAt: getTimegap(doc.data().createdAt), // timestamp로 저장된 데이터 가공
        } as PostState;
        // poststate로 들어올걸 확신해서 as를 사용함
        // as 사용하기 전에는 doc을 추론하지 못해서 계속 에러가 났음
        // console.log("newpost", newPost);
        return newPost;
      });
      setPosts(newPosts);
      // console.log("posts2", newPosts);
    });
  };

  // 현재 누른 카테고리를 category 컬렉션에 업데이트

  useEffect(() => {
    getPost();
    // console.log("posts", posts);
    // console.log("category", category);

    const getCategory = async () => {
      const snapshot = await getDoc(
        doc(dbService, "category", "currentCategory")
      );
      // console.log(snapshot.data());
      setCategory(snapshot.data().category); // 스냅샷.data() 오류났었는데 tsconfig.json에 "strictNullChecks": false, 추가해줬더니 오류안남. 이렇게 해도 괜찮은건지 확인필요
    };
    getCategory();
  }, []);

  const handleWriteNaviageClick = () => {
    // 유효성검사용
    let authWrite = authService.currentUser
      ? navigate("/createpost")
      : alert("로그인이 필요합니다!");
    return authWrite;
  };

  return (
    <Container>
      {/* 카테고리 */}
      {/* Slice로 어떻게 넣지..? */}
      <MainCategory category={category} setCategory={setCategory} />

      {/* 글쓰기 버튼 */}

      <WriteContainer>
        <WriteBt onClick={handleWriteNaviageClick}>
          <HiOutlinePencilSquare size={30} />
        </WriteBt>
      </WriteContainer>

      {/* 포스트 */}
      <PostList posts={posts} category={category} />
    </Container>
  );
}
const Container = styled.div`
  max-width: 1280px;
  width: 100%;
  margin: 20px auto;
`;

const WriteContainer = styled.div`
  width: 100%;
  text-align: right;
`;

const WriteBt = styled.button`
  background-color: none;
  border: none;
  border-radius: 50%;
  width: 52px;
  height: 52px;
  margin: 40px 0 20px 0;
  cursor: pointer;
  &:hover {
    background-color: #262b7f;
    color: #f2f2f2;
  }
`;
