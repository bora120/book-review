import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI ?? ''

// 캐시 타입 정의
type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// 전역에 캐시 타입 선언
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined
}

// 전역 객체에 안전하게 캐시 붙이기
const globalForMongoose = global as typeof globalThis & {
  _mongooseCache?: MongooseCache
}

// ✅ 이제 cached는 절대 undefined 아님 (타입에서도 보장)
const cached: MongooseCache =
  globalForMongoose._mongooseCache ??
  (globalForMongoose._mongooseCache = { conn: null, promise: null })

export async function connectDB() {
  // ❗ 실제로 DB를 연결할 때만 환경변수 체크
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI 환경 변수가 설정되어 있지 않습니다.')
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m)
  }

  cached.conn = await cached.promise
  return cached.conn
}
