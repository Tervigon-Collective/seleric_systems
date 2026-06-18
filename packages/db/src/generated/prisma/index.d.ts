
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Signal
 * 
 */
export type Signal = $Result.DefaultSelection<Prisma.$SignalPayload>
/**
 * Model Insight
 * 
 */
export type Insight = $Result.DefaultSelection<Prisma.$InsightPayload>
/**
 * Model PendingAction
 * 
 */
export type PendingAction = $Result.DefaultSelection<Prisma.$PendingActionPayload>
/**
 * Model InsightOutcome
 * 
 */
export type InsightOutcome = $Result.DefaultSelection<Prisma.$InsightOutcomePayload>
/**
 * Model AuditLog
 * 
 */
export type AuditLog = $Result.DefaultSelection<Prisma.$AuditLogPayload>
/**
 * Model AgentConfig
 * 
 */
export type AgentConfig = $Result.DefaultSelection<Prisma.$AgentConfigPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const EntityType: {
  CAMPAIGN: 'CAMPAIGN',
  ADSET: 'ADSET',
  PRODUCT: 'PRODUCT',
  STORE: 'STORE'
};

export type EntityType = (typeof EntityType)[keyof typeof EntityType]


export const InsightSeverity: {
  CRITICAL: 'CRITICAL',
  WARNING: 'WARNING',
  INFO: 'INFO'
};

export type InsightSeverity = (typeof InsightSeverity)[keyof typeof InsightSeverity]


export const RiskLevel: {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel]


export const ActionClass: {
  AUTO: 'AUTO',
  QUEUE: 'QUEUE',
  BLOCK: 'BLOCK'
};

export type ActionClass = (typeof ActionClass)[keyof typeof ActionClass]


export const ActionStatus: {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXECUTED: 'EXECUTED',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED'
};

export type ActionStatus = (typeof ActionStatus)[keyof typeof ActionStatus]

}

export type EntityType = $Enums.EntityType

export const EntityType: typeof $Enums.EntityType

export type InsightSeverity = $Enums.InsightSeverity

export const InsightSeverity: typeof $Enums.InsightSeverity

export type RiskLevel = $Enums.RiskLevel

export const RiskLevel: typeof $Enums.RiskLevel

export type ActionClass = $Enums.ActionClass

export const ActionClass: typeof $Enums.ActionClass

export type ActionStatus = $Enums.ActionStatus

export const ActionStatus: typeof $Enums.ActionStatus

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Signals
 * const signals = await prisma.signal.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Signals
   * const signals = await prisma.signal.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.signal`: Exposes CRUD operations for the **Signal** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Signals
    * const signals = await prisma.signal.findMany()
    * ```
    */
  get signal(): Prisma.SignalDelegate<ExtArgs>;

  /**
   * `prisma.insight`: Exposes CRUD operations for the **Insight** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Insights
    * const insights = await prisma.insight.findMany()
    * ```
    */
  get insight(): Prisma.InsightDelegate<ExtArgs>;

  /**
   * `prisma.pendingAction`: Exposes CRUD operations for the **PendingAction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PendingActions
    * const pendingActions = await prisma.pendingAction.findMany()
    * ```
    */
  get pendingAction(): Prisma.PendingActionDelegate<ExtArgs>;

  /**
   * `prisma.insightOutcome`: Exposes CRUD operations for the **InsightOutcome** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InsightOutcomes
    * const insightOutcomes = await prisma.insightOutcome.findMany()
    * ```
    */
  get insightOutcome(): Prisma.InsightOutcomeDelegate<ExtArgs>;

  /**
   * `prisma.auditLog`: Exposes CRUD operations for the **AuditLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditLogs
    * const auditLogs = await prisma.auditLog.findMany()
    * ```
    */
  get auditLog(): Prisma.AuditLogDelegate<ExtArgs>;

  /**
   * `prisma.agentConfig`: Exposes CRUD operations for the **AgentConfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AgentConfigs
    * const agentConfigs = await prisma.agentConfig.findMany()
    * ```
    */
  get agentConfig(): Prisma.AgentConfigDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Signal: 'Signal',
    Insight: 'Insight',
    PendingAction: 'PendingAction',
    InsightOutcome: 'InsightOutcome',
    AuditLog: 'AuditLog',
    AgentConfig: 'AgentConfig'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "signal" | "insight" | "pendingAction" | "insightOutcome" | "auditLog" | "agentConfig"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Signal: {
        payload: Prisma.$SignalPayload<ExtArgs>
        fields: Prisma.SignalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SignalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SignalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          findFirst: {
            args: Prisma.SignalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SignalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          findMany: {
            args: Prisma.SignalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>[]
          }
          create: {
            args: Prisma.SignalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          createMany: {
            args: Prisma.SignalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SignalCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>[]
          }
          delete: {
            args: Prisma.SignalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          update: {
            args: Prisma.SignalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          deleteMany: {
            args: Prisma.SignalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SignalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SignalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          aggregate: {
            args: Prisma.SignalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSignal>
          }
          groupBy: {
            args: Prisma.SignalGroupByArgs<ExtArgs>
            result: $Utils.Optional<SignalGroupByOutputType>[]
          }
          count: {
            args: Prisma.SignalCountArgs<ExtArgs>
            result: $Utils.Optional<SignalCountAggregateOutputType> | number
          }
        }
      }
      Insight: {
        payload: Prisma.$InsightPayload<ExtArgs>
        fields: Prisma.InsightFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InsightFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InsightFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightPayload>
          }
          findFirst: {
            args: Prisma.InsightFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InsightFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightPayload>
          }
          findMany: {
            args: Prisma.InsightFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightPayload>[]
          }
          create: {
            args: Prisma.InsightCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightPayload>
          }
          createMany: {
            args: Prisma.InsightCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InsightCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightPayload>[]
          }
          delete: {
            args: Prisma.InsightDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightPayload>
          }
          update: {
            args: Prisma.InsightUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightPayload>
          }
          deleteMany: {
            args: Prisma.InsightDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InsightUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.InsightUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightPayload>
          }
          aggregate: {
            args: Prisma.InsightAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInsight>
          }
          groupBy: {
            args: Prisma.InsightGroupByArgs<ExtArgs>
            result: $Utils.Optional<InsightGroupByOutputType>[]
          }
          count: {
            args: Prisma.InsightCountArgs<ExtArgs>
            result: $Utils.Optional<InsightCountAggregateOutputType> | number
          }
        }
      }
      PendingAction: {
        payload: Prisma.$PendingActionPayload<ExtArgs>
        fields: Prisma.PendingActionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PendingActionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingActionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PendingActionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingActionPayload>
          }
          findFirst: {
            args: Prisma.PendingActionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingActionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PendingActionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingActionPayload>
          }
          findMany: {
            args: Prisma.PendingActionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingActionPayload>[]
          }
          create: {
            args: Prisma.PendingActionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingActionPayload>
          }
          createMany: {
            args: Prisma.PendingActionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PendingActionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingActionPayload>[]
          }
          delete: {
            args: Prisma.PendingActionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingActionPayload>
          }
          update: {
            args: Prisma.PendingActionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingActionPayload>
          }
          deleteMany: {
            args: Prisma.PendingActionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PendingActionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PendingActionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingActionPayload>
          }
          aggregate: {
            args: Prisma.PendingActionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePendingAction>
          }
          groupBy: {
            args: Prisma.PendingActionGroupByArgs<ExtArgs>
            result: $Utils.Optional<PendingActionGroupByOutputType>[]
          }
          count: {
            args: Prisma.PendingActionCountArgs<ExtArgs>
            result: $Utils.Optional<PendingActionCountAggregateOutputType> | number
          }
        }
      }
      InsightOutcome: {
        payload: Prisma.$InsightOutcomePayload<ExtArgs>
        fields: Prisma.InsightOutcomeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InsightOutcomeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightOutcomePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InsightOutcomeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightOutcomePayload>
          }
          findFirst: {
            args: Prisma.InsightOutcomeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightOutcomePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InsightOutcomeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightOutcomePayload>
          }
          findMany: {
            args: Prisma.InsightOutcomeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightOutcomePayload>[]
          }
          create: {
            args: Prisma.InsightOutcomeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightOutcomePayload>
          }
          createMany: {
            args: Prisma.InsightOutcomeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InsightOutcomeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightOutcomePayload>[]
          }
          delete: {
            args: Prisma.InsightOutcomeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightOutcomePayload>
          }
          update: {
            args: Prisma.InsightOutcomeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightOutcomePayload>
          }
          deleteMany: {
            args: Prisma.InsightOutcomeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InsightOutcomeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.InsightOutcomeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsightOutcomePayload>
          }
          aggregate: {
            args: Prisma.InsightOutcomeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInsightOutcome>
          }
          groupBy: {
            args: Prisma.InsightOutcomeGroupByArgs<ExtArgs>
            result: $Utils.Optional<InsightOutcomeGroupByOutputType>[]
          }
          count: {
            args: Prisma.InsightOutcomeCountArgs<ExtArgs>
            result: $Utils.Optional<InsightOutcomeCountAggregateOutputType> | number
          }
        }
      }
      AuditLog: {
        payload: Prisma.$AuditLogPayload<ExtArgs>
        fields: Prisma.AuditLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findFirst: {
            args: Prisma.AuditLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findMany: {
            args: Prisma.AuditLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          create: {
            args: Prisma.AuditLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          createMany: {
            args: Prisma.AuditLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuditLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          delete: {
            args: Prisma.AuditLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          update: {
            args: Prisma.AuditLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          deleteMany: {
            args: Prisma.AuditLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuditLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AuditLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          aggregate: {
            args: Prisma.AuditLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuditLog>
          }
          groupBy: {
            args: Prisma.AuditLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuditLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuditLogCountArgs<ExtArgs>
            result: $Utils.Optional<AuditLogCountAggregateOutputType> | number
          }
        }
      }
      AgentConfig: {
        payload: Prisma.$AgentConfigPayload<ExtArgs>
        fields: Prisma.AgentConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AgentConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AgentConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentConfigPayload>
          }
          findFirst: {
            args: Prisma.AgentConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AgentConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentConfigPayload>
          }
          findMany: {
            args: Prisma.AgentConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentConfigPayload>[]
          }
          create: {
            args: Prisma.AgentConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentConfigPayload>
          }
          createMany: {
            args: Prisma.AgentConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AgentConfigCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentConfigPayload>[]
          }
          delete: {
            args: Prisma.AgentConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentConfigPayload>
          }
          update: {
            args: Prisma.AgentConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentConfigPayload>
          }
          deleteMany: {
            args: Prisma.AgentConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AgentConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AgentConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentConfigPayload>
          }
          aggregate: {
            args: Prisma.AgentConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAgentConfig>
          }
          groupBy: {
            args: Prisma.AgentConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<AgentConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.AgentConfigCountArgs<ExtArgs>
            result: $Utils.Optional<AgentConfigCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type SignalCountOutputType
   */

  export type SignalCountOutputType = {
    insights: number
    pendingActions: number
    auditLogs: number
  }

  export type SignalCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    insights?: boolean | SignalCountOutputTypeCountInsightsArgs
    pendingActions?: boolean | SignalCountOutputTypeCountPendingActionsArgs
    auditLogs?: boolean | SignalCountOutputTypeCountAuditLogsArgs
  }

  // Custom InputTypes
  /**
   * SignalCountOutputType without action
   */
  export type SignalCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalCountOutputType
     */
    select?: SignalCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SignalCountOutputType without action
   */
  export type SignalCountOutputTypeCountInsightsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InsightWhereInput
  }

  /**
   * SignalCountOutputType without action
   */
  export type SignalCountOutputTypeCountPendingActionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PendingActionWhereInput
  }

  /**
   * SignalCountOutputType without action
   */
  export type SignalCountOutputTypeCountAuditLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
  }


  /**
   * Count Type InsightCountOutputType
   */

  export type InsightCountOutputType = {
    outcomes: number
  }

  export type InsightCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    outcomes?: boolean | InsightCountOutputTypeCountOutcomesArgs
  }

  // Custom InputTypes
  /**
   * InsightCountOutputType without action
   */
  export type InsightCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InsightCountOutputType
     */
    select?: InsightCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * InsightCountOutputType without action
   */
  export type InsightCountOutputTypeCountOutcomesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InsightOutcomeWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Signal
   */

  export type AggregateSignal = {
    _count: SignalCountAggregateOutputType | null
    _min: SignalMinAggregateOutputType | null
    _max: SignalMaxAggregateOutputType | null
  }

  export type SignalMinAggregateOutputType = {
    id: string | null
    entityType: $Enums.EntityType | null
    entityId: string | null
    signalType: string | null
    traceId: string | null
    firedAt: Date | null
  }

  export type SignalMaxAggregateOutputType = {
    id: string | null
    entityType: $Enums.EntityType | null
    entityId: string | null
    signalType: string | null
    traceId: string | null
    firedAt: Date | null
  }

  export type SignalCountAggregateOutputType = {
    id: number
    entityType: number
    entityId: number
    signalType: number
    contextSnapshot: number
    traceId: number
    firedAt: number
    _all: number
  }


  export type SignalMinAggregateInputType = {
    id?: true
    entityType?: true
    entityId?: true
    signalType?: true
    traceId?: true
    firedAt?: true
  }

  export type SignalMaxAggregateInputType = {
    id?: true
    entityType?: true
    entityId?: true
    signalType?: true
    traceId?: true
    firedAt?: true
  }

  export type SignalCountAggregateInputType = {
    id?: true
    entityType?: true
    entityId?: true
    signalType?: true
    contextSnapshot?: true
    traceId?: true
    firedAt?: true
    _all?: true
  }

  export type SignalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Signal to aggregate.
     */
    where?: SignalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Signals to fetch.
     */
    orderBy?: SignalOrderByWithRelationInput | SignalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SignalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Signals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Signals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Signals
    **/
    _count?: true | SignalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SignalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SignalMaxAggregateInputType
  }

  export type GetSignalAggregateType<T extends SignalAggregateArgs> = {
        [P in keyof T & keyof AggregateSignal]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSignal[P]>
      : GetScalarType<T[P], AggregateSignal[P]>
  }




  export type SignalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SignalWhereInput
    orderBy?: SignalOrderByWithAggregationInput | SignalOrderByWithAggregationInput[]
    by: SignalScalarFieldEnum[] | SignalScalarFieldEnum
    having?: SignalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SignalCountAggregateInputType | true
    _min?: SignalMinAggregateInputType
    _max?: SignalMaxAggregateInputType
  }

  export type SignalGroupByOutputType = {
    id: string
    entityType: $Enums.EntityType
    entityId: string
    signalType: string
    contextSnapshot: JsonValue
    traceId: string
    firedAt: Date
    _count: SignalCountAggregateOutputType | null
    _min: SignalMinAggregateOutputType | null
    _max: SignalMaxAggregateOutputType | null
  }

  type GetSignalGroupByPayload<T extends SignalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SignalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SignalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SignalGroupByOutputType[P]>
            : GetScalarType<T[P], SignalGroupByOutputType[P]>
        }
      >
    >


  export type SignalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entityType?: boolean
    entityId?: boolean
    signalType?: boolean
    contextSnapshot?: boolean
    traceId?: boolean
    firedAt?: boolean
    insights?: boolean | Signal$insightsArgs<ExtArgs>
    pendingActions?: boolean | Signal$pendingActionsArgs<ExtArgs>
    auditLogs?: boolean | Signal$auditLogsArgs<ExtArgs>
    _count?: boolean | SignalCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["signal"]>

  export type SignalSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entityType?: boolean
    entityId?: boolean
    signalType?: boolean
    contextSnapshot?: boolean
    traceId?: boolean
    firedAt?: boolean
  }, ExtArgs["result"]["signal"]>

  export type SignalSelectScalar = {
    id?: boolean
    entityType?: boolean
    entityId?: boolean
    signalType?: boolean
    contextSnapshot?: boolean
    traceId?: boolean
    firedAt?: boolean
  }

  export type SignalInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    insights?: boolean | Signal$insightsArgs<ExtArgs>
    pendingActions?: boolean | Signal$pendingActionsArgs<ExtArgs>
    auditLogs?: boolean | Signal$auditLogsArgs<ExtArgs>
    _count?: boolean | SignalCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SignalIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SignalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Signal"
    objects: {
      insights: Prisma.$InsightPayload<ExtArgs>[]
      pendingActions: Prisma.$PendingActionPayload<ExtArgs>[]
      auditLogs: Prisma.$AuditLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      entityType: $Enums.EntityType
      entityId: string
      signalType: string
      contextSnapshot: Prisma.JsonValue
      traceId: string
      firedAt: Date
    }, ExtArgs["result"]["signal"]>
    composites: {}
  }

  type SignalGetPayload<S extends boolean | null | undefined | SignalDefaultArgs> = $Result.GetResult<Prisma.$SignalPayload, S>

  type SignalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SignalFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SignalCountAggregateInputType | true
    }

  export interface SignalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Signal'], meta: { name: 'Signal' } }
    /**
     * Find zero or one Signal that matches the filter.
     * @param {SignalFindUniqueArgs} args - Arguments to find a Signal
     * @example
     * // Get one Signal
     * const signal = await prisma.signal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SignalFindUniqueArgs>(args: SelectSubset<T, SignalFindUniqueArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Signal that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SignalFindUniqueOrThrowArgs} args - Arguments to find a Signal
     * @example
     * // Get one Signal
     * const signal = await prisma.signal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SignalFindUniqueOrThrowArgs>(args: SelectSubset<T, SignalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Signal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalFindFirstArgs} args - Arguments to find a Signal
     * @example
     * // Get one Signal
     * const signal = await prisma.signal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SignalFindFirstArgs>(args?: SelectSubset<T, SignalFindFirstArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Signal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalFindFirstOrThrowArgs} args - Arguments to find a Signal
     * @example
     * // Get one Signal
     * const signal = await prisma.signal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SignalFindFirstOrThrowArgs>(args?: SelectSubset<T, SignalFindFirstOrThrowArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Signals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Signals
     * const signals = await prisma.signal.findMany()
     * 
     * // Get first 10 Signals
     * const signals = await prisma.signal.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const signalWithIdOnly = await prisma.signal.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SignalFindManyArgs>(args?: SelectSubset<T, SignalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Signal.
     * @param {SignalCreateArgs} args - Arguments to create a Signal.
     * @example
     * // Create one Signal
     * const Signal = await prisma.signal.create({
     *   data: {
     *     // ... data to create a Signal
     *   }
     * })
     * 
     */
    create<T extends SignalCreateArgs>(args: SelectSubset<T, SignalCreateArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Signals.
     * @param {SignalCreateManyArgs} args - Arguments to create many Signals.
     * @example
     * // Create many Signals
     * const signal = await prisma.signal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SignalCreateManyArgs>(args?: SelectSubset<T, SignalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Signals and returns the data saved in the database.
     * @param {SignalCreateManyAndReturnArgs} args - Arguments to create many Signals.
     * @example
     * // Create many Signals
     * const signal = await prisma.signal.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Signals and only return the `id`
     * const signalWithIdOnly = await prisma.signal.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SignalCreateManyAndReturnArgs>(args?: SelectSubset<T, SignalCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Signal.
     * @param {SignalDeleteArgs} args - Arguments to delete one Signal.
     * @example
     * // Delete one Signal
     * const Signal = await prisma.signal.delete({
     *   where: {
     *     // ... filter to delete one Signal
     *   }
     * })
     * 
     */
    delete<T extends SignalDeleteArgs>(args: SelectSubset<T, SignalDeleteArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Signal.
     * @param {SignalUpdateArgs} args - Arguments to update one Signal.
     * @example
     * // Update one Signal
     * const signal = await prisma.signal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SignalUpdateArgs>(args: SelectSubset<T, SignalUpdateArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Signals.
     * @param {SignalDeleteManyArgs} args - Arguments to filter Signals to delete.
     * @example
     * // Delete a few Signals
     * const { count } = await prisma.signal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SignalDeleteManyArgs>(args?: SelectSubset<T, SignalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Signals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Signals
     * const signal = await prisma.signal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SignalUpdateManyArgs>(args: SelectSubset<T, SignalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Signal.
     * @param {SignalUpsertArgs} args - Arguments to update or create a Signal.
     * @example
     * // Update or create a Signal
     * const signal = await prisma.signal.upsert({
     *   create: {
     *     // ... data to create a Signal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Signal we want to update
     *   }
     * })
     */
    upsert<T extends SignalUpsertArgs>(args: SelectSubset<T, SignalUpsertArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Signals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalCountArgs} args - Arguments to filter Signals to count.
     * @example
     * // Count the number of Signals
     * const count = await prisma.signal.count({
     *   where: {
     *     // ... the filter for the Signals we want to count
     *   }
     * })
    **/
    count<T extends SignalCountArgs>(
      args?: Subset<T, SignalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SignalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Signal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SignalAggregateArgs>(args: Subset<T, SignalAggregateArgs>): Prisma.PrismaPromise<GetSignalAggregateType<T>>

    /**
     * Group by Signal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SignalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SignalGroupByArgs['orderBy'] }
        : { orderBy?: SignalGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SignalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSignalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Signal model
   */
  readonly fields: SignalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Signal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SignalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    insights<T extends Signal$insightsArgs<ExtArgs> = {}>(args?: Subset<T, Signal$insightsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InsightPayload<ExtArgs>, T, "findMany"> | Null>
    pendingActions<T extends Signal$pendingActionsArgs<ExtArgs> = {}>(args?: Subset<T, Signal$pendingActionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PendingActionPayload<ExtArgs>, T, "findMany"> | Null>
    auditLogs<T extends Signal$auditLogsArgs<ExtArgs> = {}>(args?: Subset<T, Signal$auditLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Signal model
   */ 
  interface SignalFieldRefs {
    readonly id: FieldRef<"Signal", 'String'>
    readonly entityType: FieldRef<"Signal", 'EntityType'>
    readonly entityId: FieldRef<"Signal", 'String'>
    readonly signalType: FieldRef<"Signal", 'String'>
    readonly contextSnapshot: FieldRef<"Signal", 'Json'>
    readonly traceId: FieldRef<"Signal", 'String'>
    readonly firedAt: FieldRef<"Signal", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Signal findUnique
   */
  export type SignalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter, which Signal to fetch.
     */
    where: SignalWhereUniqueInput
  }

  /**
   * Signal findUniqueOrThrow
   */
  export type SignalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter, which Signal to fetch.
     */
    where: SignalWhereUniqueInput
  }

  /**
   * Signal findFirst
   */
  export type SignalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter, which Signal to fetch.
     */
    where?: SignalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Signals to fetch.
     */
    orderBy?: SignalOrderByWithRelationInput | SignalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Signals.
     */
    cursor?: SignalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Signals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Signals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Signals.
     */
    distinct?: SignalScalarFieldEnum | SignalScalarFieldEnum[]
  }

  /**
   * Signal findFirstOrThrow
   */
  export type SignalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter, which Signal to fetch.
     */
    where?: SignalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Signals to fetch.
     */
    orderBy?: SignalOrderByWithRelationInput | SignalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Signals.
     */
    cursor?: SignalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Signals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Signals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Signals.
     */
    distinct?: SignalScalarFieldEnum | SignalScalarFieldEnum[]
  }

  /**
   * Signal findMany
   */
  export type SignalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter, which Signals to fetch.
     */
    where?: SignalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Signals to fetch.
     */
    orderBy?: SignalOrderByWithRelationInput | SignalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Signals.
     */
    cursor?: SignalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Signals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Signals.
     */
    skip?: number
    distinct?: SignalScalarFieldEnum | SignalScalarFieldEnum[]
  }

  /**
   * Signal create
   */
  export type SignalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * The data needed to create a Signal.
     */
    data: XOR<SignalCreateInput, SignalUncheckedCreateInput>
  }

  /**
   * Signal createMany
   */
  export type SignalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Signals.
     */
    data: SignalCreateManyInput | SignalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Signal createManyAndReturn
   */
  export type SignalCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Signals.
     */
    data: SignalCreateManyInput | SignalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Signal update
   */
  export type SignalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * The data needed to update a Signal.
     */
    data: XOR<SignalUpdateInput, SignalUncheckedUpdateInput>
    /**
     * Choose, which Signal to update.
     */
    where: SignalWhereUniqueInput
  }

  /**
   * Signal updateMany
   */
  export type SignalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Signals.
     */
    data: XOR<SignalUpdateManyMutationInput, SignalUncheckedUpdateManyInput>
    /**
     * Filter which Signals to update
     */
    where?: SignalWhereInput
  }

  /**
   * Signal upsert
   */
  export type SignalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * The filter to search for the Signal to update in case it exists.
     */
    where: SignalWhereUniqueInput
    /**
     * In case the Signal found by the `where` argument doesn't exist, create a new Signal with this data.
     */
    create: XOR<SignalCreateInput, SignalUncheckedCreateInput>
    /**
     * In case the Signal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SignalUpdateInput, SignalUncheckedUpdateInput>
  }

  /**
   * Signal delete
   */
  export type SignalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter which Signal to delete.
     */
    where: SignalWhereUniqueInput
  }

  /**
   * Signal deleteMany
   */
  export type SignalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Signals to delete
     */
    where?: SignalWhereInput
  }

  /**
   * Signal.insights
   */
  export type Signal$insightsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insight
     */
    select?: InsightSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightInclude<ExtArgs> | null
    where?: InsightWhereInput
    orderBy?: InsightOrderByWithRelationInput | InsightOrderByWithRelationInput[]
    cursor?: InsightWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InsightScalarFieldEnum | InsightScalarFieldEnum[]
  }

  /**
   * Signal.pendingActions
   */
  export type Signal$pendingActionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingAction
     */
    select?: PendingActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingActionInclude<ExtArgs> | null
    where?: PendingActionWhereInput
    orderBy?: PendingActionOrderByWithRelationInput | PendingActionOrderByWithRelationInput[]
    cursor?: PendingActionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PendingActionScalarFieldEnum | PendingActionScalarFieldEnum[]
  }

  /**
   * Signal.auditLogs
   */
  export type Signal$auditLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    cursor?: AuditLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * Signal without action
   */
  export type SignalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
  }


  /**
   * Model Insight
   */

  export type AggregateInsight = {
    _count: InsightCountAggregateOutputType | null
    _avg: InsightAvgAggregateOutputType | null
    _sum: InsightSumAggregateOutputType | null
    _min: InsightMinAggregateOutputType | null
    _max: InsightMaxAggregateOutputType | null
  }

  export type InsightAvgAggregateOutputType = {
    confidence: number | null
  }

  export type InsightSumAggregateOutputType = {
    confidence: number | null
  }

  export type InsightMinAggregateOutputType = {
    id: string | null
    signalId: string | null
    severity: $Enums.InsightSeverity | null
    title: string | null
    what: string | null
    why: string | null
    confidence: number | null
    agent: string | null
    createdAt: Date | null
    dismissedAt: Date | null
    snoozedUntil: Date | null
  }

  export type InsightMaxAggregateOutputType = {
    id: string | null
    signalId: string | null
    severity: $Enums.InsightSeverity | null
    title: string | null
    what: string | null
    why: string | null
    confidence: number | null
    agent: string | null
    createdAt: Date | null
    dismissedAt: Date | null
    snoozedUntil: Date | null
  }

  export type InsightCountAggregateOutputType = {
    id: number
    signalId: number
    severity: number
    title: number
    what: number
    why: number
    evidence: number
    confidence: number
    agent: number
    createdAt: number
    dismissedAt: number
    snoozedUntil: number
    _all: number
  }


  export type InsightAvgAggregateInputType = {
    confidence?: true
  }

  export type InsightSumAggregateInputType = {
    confidence?: true
  }

  export type InsightMinAggregateInputType = {
    id?: true
    signalId?: true
    severity?: true
    title?: true
    what?: true
    why?: true
    confidence?: true
    agent?: true
    createdAt?: true
    dismissedAt?: true
    snoozedUntil?: true
  }

  export type InsightMaxAggregateInputType = {
    id?: true
    signalId?: true
    severity?: true
    title?: true
    what?: true
    why?: true
    confidence?: true
    agent?: true
    createdAt?: true
    dismissedAt?: true
    snoozedUntil?: true
  }

  export type InsightCountAggregateInputType = {
    id?: true
    signalId?: true
    severity?: true
    title?: true
    what?: true
    why?: true
    evidence?: true
    confidence?: true
    agent?: true
    createdAt?: true
    dismissedAt?: true
    snoozedUntil?: true
    _all?: true
  }

  export type InsightAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Insight to aggregate.
     */
    where?: InsightWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Insights to fetch.
     */
    orderBy?: InsightOrderByWithRelationInput | InsightOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InsightWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Insights from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Insights.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Insights
    **/
    _count?: true | InsightCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InsightAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InsightSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InsightMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InsightMaxAggregateInputType
  }

  export type GetInsightAggregateType<T extends InsightAggregateArgs> = {
        [P in keyof T & keyof AggregateInsight]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInsight[P]>
      : GetScalarType<T[P], AggregateInsight[P]>
  }




  export type InsightGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InsightWhereInput
    orderBy?: InsightOrderByWithAggregationInput | InsightOrderByWithAggregationInput[]
    by: InsightScalarFieldEnum[] | InsightScalarFieldEnum
    having?: InsightScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InsightCountAggregateInputType | true
    _avg?: InsightAvgAggregateInputType
    _sum?: InsightSumAggregateInputType
    _min?: InsightMinAggregateInputType
    _max?: InsightMaxAggregateInputType
  }

  export type InsightGroupByOutputType = {
    id: string
    signalId: string
    severity: $Enums.InsightSeverity
    title: string
    what: string
    why: string
    evidence: JsonValue
    confidence: number
    agent: string
    createdAt: Date
    dismissedAt: Date | null
    snoozedUntil: Date | null
    _count: InsightCountAggregateOutputType | null
    _avg: InsightAvgAggregateOutputType | null
    _sum: InsightSumAggregateOutputType | null
    _min: InsightMinAggregateOutputType | null
    _max: InsightMaxAggregateOutputType | null
  }

  type GetInsightGroupByPayload<T extends InsightGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InsightGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InsightGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InsightGroupByOutputType[P]>
            : GetScalarType<T[P], InsightGroupByOutputType[P]>
        }
      >
    >


  export type InsightSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    signalId?: boolean
    severity?: boolean
    title?: boolean
    what?: boolean
    why?: boolean
    evidence?: boolean
    confidence?: boolean
    agent?: boolean
    createdAt?: boolean
    dismissedAt?: boolean
    snoozedUntil?: boolean
    signal?: boolean | SignalDefaultArgs<ExtArgs>
    outcomes?: boolean | Insight$outcomesArgs<ExtArgs>
    _count?: boolean | InsightCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["insight"]>

  export type InsightSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    signalId?: boolean
    severity?: boolean
    title?: boolean
    what?: boolean
    why?: boolean
    evidence?: boolean
    confidence?: boolean
    agent?: boolean
    createdAt?: boolean
    dismissedAt?: boolean
    snoozedUntil?: boolean
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["insight"]>

  export type InsightSelectScalar = {
    id?: boolean
    signalId?: boolean
    severity?: boolean
    title?: boolean
    what?: boolean
    why?: boolean
    evidence?: boolean
    confidence?: boolean
    agent?: boolean
    createdAt?: boolean
    dismissedAt?: boolean
    snoozedUntil?: boolean
  }

  export type InsightInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    signal?: boolean | SignalDefaultArgs<ExtArgs>
    outcomes?: boolean | Insight$outcomesArgs<ExtArgs>
    _count?: boolean | InsightCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type InsightIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }

  export type $InsightPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Insight"
    objects: {
      signal: Prisma.$SignalPayload<ExtArgs>
      outcomes: Prisma.$InsightOutcomePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      signalId: string
      severity: $Enums.InsightSeverity
      title: string
      what: string
      why: string
      evidence: Prisma.JsonValue
      confidence: number
      agent: string
      createdAt: Date
      dismissedAt: Date | null
      snoozedUntil: Date | null
    }, ExtArgs["result"]["insight"]>
    composites: {}
  }

  type InsightGetPayload<S extends boolean | null | undefined | InsightDefaultArgs> = $Result.GetResult<Prisma.$InsightPayload, S>

  type InsightCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<InsightFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: InsightCountAggregateInputType | true
    }

  export interface InsightDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Insight'], meta: { name: 'Insight' } }
    /**
     * Find zero or one Insight that matches the filter.
     * @param {InsightFindUniqueArgs} args - Arguments to find a Insight
     * @example
     * // Get one Insight
     * const insight = await prisma.insight.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InsightFindUniqueArgs>(args: SelectSubset<T, InsightFindUniqueArgs<ExtArgs>>): Prisma__InsightClient<$Result.GetResult<Prisma.$InsightPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Insight that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {InsightFindUniqueOrThrowArgs} args - Arguments to find a Insight
     * @example
     * // Get one Insight
     * const insight = await prisma.insight.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InsightFindUniqueOrThrowArgs>(args: SelectSubset<T, InsightFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InsightClient<$Result.GetResult<Prisma.$InsightPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Insight that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsightFindFirstArgs} args - Arguments to find a Insight
     * @example
     * // Get one Insight
     * const insight = await prisma.insight.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InsightFindFirstArgs>(args?: SelectSubset<T, InsightFindFirstArgs<ExtArgs>>): Prisma__InsightClient<$Result.GetResult<Prisma.$InsightPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Insight that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsightFindFirstOrThrowArgs} args - Arguments to find a Insight
     * @example
     * // Get one Insight
     * const insight = await prisma.insight.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InsightFindFirstOrThrowArgs>(args?: SelectSubset<T, InsightFindFirstOrThrowArgs<ExtArgs>>): Prisma__InsightClient<$Result.GetResult<Prisma.$InsightPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Insights that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsightFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Insights
     * const insights = await prisma.insight.findMany()
     * 
     * // Get first 10 Insights
     * const insights = await prisma.insight.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const insightWithIdOnly = await prisma.insight.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InsightFindManyArgs>(args?: SelectSubset<T, InsightFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InsightPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Insight.
     * @param {InsightCreateArgs} args - Arguments to create a Insight.
     * @example
     * // Create one Insight
     * const Insight = await prisma.insight.create({
     *   data: {
     *     // ... data to create a Insight
     *   }
     * })
     * 
     */
    create<T extends InsightCreateArgs>(args: SelectSubset<T, InsightCreateArgs<ExtArgs>>): Prisma__InsightClient<$Result.GetResult<Prisma.$InsightPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Insights.
     * @param {InsightCreateManyArgs} args - Arguments to create many Insights.
     * @example
     * // Create many Insights
     * const insight = await prisma.insight.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InsightCreateManyArgs>(args?: SelectSubset<T, InsightCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Insights and returns the data saved in the database.
     * @param {InsightCreateManyAndReturnArgs} args - Arguments to create many Insights.
     * @example
     * // Create many Insights
     * const insight = await prisma.insight.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Insights and only return the `id`
     * const insightWithIdOnly = await prisma.insight.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InsightCreateManyAndReturnArgs>(args?: SelectSubset<T, InsightCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InsightPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Insight.
     * @param {InsightDeleteArgs} args - Arguments to delete one Insight.
     * @example
     * // Delete one Insight
     * const Insight = await prisma.insight.delete({
     *   where: {
     *     // ... filter to delete one Insight
     *   }
     * })
     * 
     */
    delete<T extends InsightDeleteArgs>(args: SelectSubset<T, InsightDeleteArgs<ExtArgs>>): Prisma__InsightClient<$Result.GetResult<Prisma.$InsightPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Insight.
     * @param {InsightUpdateArgs} args - Arguments to update one Insight.
     * @example
     * // Update one Insight
     * const insight = await prisma.insight.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InsightUpdateArgs>(args: SelectSubset<T, InsightUpdateArgs<ExtArgs>>): Prisma__InsightClient<$Result.GetResult<Prisma.$InsightPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Insights.
     * @param {InsightDeleteManyArgs} args - Arguments to filter Insights to delete.
     * @example
     * // Delete a few Insights
     * const { count } = await prisma.insight.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InsightDeleteManyArgs>(args?: SelectSubset<T, InsightDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Insights.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsightUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Insights
     * const insight = await prisma.insight.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InsightUpdateManyArgs>(args: SelectSubset<T, InsightUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Insight.
     * @param {InsightUpsertArgs} args - Arguments to update or create a Insight.
     * @example
     * // Update or create a Insight
     * const insight = await prisma.insight.upsert({
     *   create: {
     *     // ... data to create a Insight
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Insight we want to update
     *   }
     * })
     */
    upsert<T extends InsightUpsertArgs>(args: SelectSubset<T, InsightUpsertArgs<ExtArgs>>): Prisma__InsightClient<$Result.GetResult<Prisma.$InsightPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Insights.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsightCountArgs} args - Arguments to filter Insights to count.
     * @example
     * // Count the number of Insights
     * const count = await prisma.insight.count({
     *   where: {
     *     // ... the filter for the Insights we want to count
     *   }
     * })
    **/
    count<T extends InsightCountArgs>(
      args?: Subset<T, InsightCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InsightCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Insight.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsightAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InsightAggregateArgs>(args: Subset<T, InsightAggregateArgs>): Prisma.PrismaPromise<GetInsightAggregateType<T>>

    /**
     * Group by Insight.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsightGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InsightGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InsightGroupByArgs['orderBy'] }
        : { orderBy?: InsightGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InsightGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInsightGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Insight model
   */
  readonly fields: InsightFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Insight.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InsightClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    signal<T extends SignalDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SignalDefaultArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    outcomes<T extends Insight$outcomesArgs<ExtArgs> = {}>(args?: Subset<T, Insight$outcomesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InsightOutcomePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Insight model
   */ 
  interface InsightFieldRefs {
    readonly id: FieldRef<"Insight", 'String'>
    readonly signalId: FieldRef<"Insight", 'String'>
    readonly severity: FieldRef<"Insight", 'InsightSeverity'>
    readonly title: FieldRef<"Insight", 'String'>
    readonly what: FieldRef<"Insight", 'String'>
    readonly why: FieldRef<"Insight", 'String'>
    readonly evidence: FieldRef<"Insight", 'Json'>
    readonly confidence: FieldRef<"Insight", 'Float'>
    readonly agent: FieldRef<"Insight", 'String'>
    readonly createdAt: FieldRef<"Insight", 'DateTime'>
    readonly dismissedAt: FieldRef<"Insight", 'DateTime'>
    readonly snoozedUntil: FieldRef<"Insight", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Insight findUnique
   */
  export type InsightFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insight
     */
    select?: InsightSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightInclude<ExtArgs> | null
    /**
     * Filter, which Insight to fetch.
     */
    where: InsightWhereUniqueInput
  }

  /**
   * Insight findUniqueOrThrow
   */
  export type InsightFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insight
     */
    select?: InsightSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightInclude<ExtArgs> | null
    /**
     * Filter, which Insight to fetch.
     */
    where: InsightWhereUniqueInput
  }

  /**
   * Insight findFirst
   */
  export type InsightFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insight
     */
    select?: InsightSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightInclude<ExtArgs> | null
    /**
     * Filter, which Insight to fetch.
     */
    where?: InsightWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Insights to fetch.
     */
    orderBy?: InsightOrderByWithRelationInput | InsightOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Insights.
     */
    cursor?: InsightWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Insights from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Insights.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Insights.
     */
    distinct?: InsightScalarFieldEnum | InsightScalarFieldEnum[]
  }

  /**
   * Insight findFirstOrThrow
   */
  export type InsightFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insight
     */
    select?: InsightSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightInclude<ExtArgs> | null
    /**
     * Filter, which Insight to fetch.
     */
    where?: InsightWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Insights to fetch.
     */
    orderBy?: InsightOrderByWithRelationInput | InsightOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Insights.
     */
    cursor?: InsightWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Insights from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Insights.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Insights.
     */
    distinct?: InsightScalarFieldEnum | InsightScalarFieldEnum[]
  }

  /**
   * Insight findMany
   */
  export type InsightFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insight
     */
    select?: InsightSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightInclude<ExtArgs> | null
    /**
     * Filter, which Insights to fetch.
     */
    where?: InsightWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Insights to fetch.
     */
    orderBy?: InsightOrderByWithRelationInput | InsightOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Insights.
     */
    cursor?: InsightWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Insights from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Insights.
     */
    skip?: number
    distinct?: InsightScalarFieldEnum | InsightScalarFieldEnum[]
  }

  /**
   * Insight create
   */
  export type InsightCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insight
     */
    select?: InsightSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightInclude<ExtArgs> | null
    /**
     * The data needed to create a Insight.
     */
    data: XOR<InsightCreateInput, InsightUncheckedCreateInput>
  }

  /**
   * Insight createMany
   */
  export type InsightCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Insights.
     */
    data: InsightCreateManyInput | InsightCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Insight createManyAndReturn
   */
  export type InsightCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insight
     */
    select?: InsightSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Insights.
     */
    data: InsightCreateManyInput | InsightCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Insight update
   */
  export type InsightUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insight
     */
    select?: InsightSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightInclude<ExtArgs> | null
    /**
     * The data needed to update a Insight.
     */
    data: XOR<InsightUpdateInput, InsightUncheckedUpdateInput>
    /**
     * Choose, which Insight to update.
     */
    where: InsightWhereUniqueInput
  }

  /**
   * Insight updateMany
   */
  export type InsightUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Insights.
     */
    data: XOR<InsightUpdateManyMutationInput, InsightUncheckedUpdateManyInput>
    /**
     * Filter which Insights to update
     */
    where?: InsightWhereInput
  }

  /**
   * Insight upsert
   */
  export type InsightUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insight
     */
    select?: InsightSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightInclude<ExtArgs> | null
    /**
     * The filter to search for the Insight to update in case it exists.
     */
    where: InsightWhereUniqueInput
    /**
     * In case the Insight found by the `where` argument doesn't exist, create a new Insight with this data.
     */
    create: XOR<InsightCreateInput, InsightUncheckedCreateInput>
    /**
     * In case the Insight was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InsightUpdateInput, InsightUncheckedUpdateInput>
  }

  /**
   * Insight delete
   */
  export type InsightDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insight
     */
    select?: InsightSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightInclude<ExtArgs> | null
    /**
     * Filter which Insight to delete.
     */
    where: InsightWhereUniqueInput
  }

  /**
   * Insight deleteMany
   */
  export type InsightDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Insights to delete
     */
    where?: InsightWhereInput
  }

  /**
   * Insight.outcomes
   */
  export type Insight$outcomesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InsightOutcome
     */
    select?: InsightOutcomeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightOutcomeInclude<ExtArgs> | null
    where?: InsightOutcomeWhereInput
    orderBy?: InsightOutcomeOrderByWithRelationInput | InsightOutcomeOrderByWithRelationInput[]
    cursor?: InsightOutcomeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InsightOutcomeScalarFieldEnum | InsightOutcomeScalarFieldEnum[]
  }

  /**
   * Insight without action
   */
  export type InsightDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insight
     */
    select?: InsightSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightInclude<ExtArgs> | null
  }


  /**
   * Model PendingAction
   */

  export type AggregatePendingAction = {
    _count: PendingActionCountAggregateOutputType | null
    _avg: PendingActionAvgAggregateOutputType | null
    _sum: PendingActionSumAggregateOutputType | null
    _min: PendingActionMinAggregateOutputType | null
    _max: PendingActionMaxAggregateOutputType | null
  }

  export type PendingActionAvgAggregateOutputType = {
    confidence: number | null
  }

  export type PendingActionSumAggregateOutputType = {
    confidence: number | null
  }

  export type PendingActionMinAggregateOutputType = {
    id: string | null
    signalId: string | null
    agent: string | null
    actionType: string | null
    rationale: string | null
    expectedOutcome: string | null
    confidence: number | null
    riskLevel: $Enums.RiskLevel | null
    classification: $Enums.ActionClass | null
    status: $Enums.ActionStatus | null
    guardrailRule: string | null
    approvalToken: string | null
    approvedBy: string | null
    approvedAt: Date | null
    rejectedReason: string | null
    rejectedAt: Date | null
    executedAt: Date | null
    executionError: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PendingActionMaxAggregateOutputType = {
    id: string | null
    signalId: string | null
    agent: string | null
    actionType: string | null
    rationale: string | null
    expectedOutcome: string | null
    confidence: number | null
    riskLevel: $Enums.RiskLevel | null
    classification: $Enums.ActionClass | null
    status: $Enums.ActionStatus | null
    guardrailRule: string | null
    approvalToken: string | null
    approvedBy: string | null
    approvedAt: Date | null
    rejectedReason: string | null
    rejectedAt: Date | null
    executedAt: Date | null
    executionError: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PendingActionCountAggregateOutputType = {
    id: number
    signalId: number
    agent: number
    actionType: number
    actionPayload: number
    rationale: number
    expectedOutcome: number
    confidence: number
    riskLevel: number
    classification: number
    status: number
    guardrailRule: number
    approvalToken: number
    approvedBy: number
    approvedAt: number
    rejectedReason: number
    rejectedAt: number
    executedAt: number
    executionResult: number
    executionError: number
    expiresAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PendingActionAvgAggregateInputType = {
    confidence?: true
  }

  export type PendingActionSumAggregateInputType = {
    confidence?: true
  }

  export type PendingActionMinAggregateInputType = {
    id?: true
    signalId?: true
    agent?: true
    actionType?: true
    rationale?: true
    expectedOutcome?: true
    confidence?: true
    riskLevel?: true
    classification?: true
    status?: true
    guardrailRule?: true
    approvalToken?: true
    approvedBy?: true
    approvedAt?: true
    rejectedReason?: true
    rejectedAt?: true
    executedAt?: true
    executionError?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PendingActionMaxAggregateInputType = {
    id?: true
    signalId?: true
    agent?: true
    actionType?: true
    rationale?: true
    expectedOutcome?: true
    confidence?: true
    riskLevel?: true
    classification?: true
    status?: true
    guardrailRule?: true
    approvalToken?: true
    approvedBy?: true
    approvedAt?: true
    rejectedReason?: true
    rejectedAt?: true
    executedAt?: true
    executionError?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PendingActionCountAggregateInputType = {
    id?: true
    signalId?: true
    agent?: true
    actionType?: true
    actionPayload?: true
    rationale?: true
    expectedOutcome?: true
    confidence?: true
    riskLevel?: true
    classification?: true
    status?: true
    guardrailRule?: true
    approvalToken?: true
    approvedBy?: true
    approvedAt?: true
    rejectedReason?: true
    rejectedAt?: true
    executedAt?: true
    executionResult?: true
    executionError?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PendingActionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PendingAction to aggregate.
     */
    where?: PendingActionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PendingActions to fetch.
     */
    orderBy?: PendingActionOrderByWithRelationInput | PendingActionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PendingActionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PendingActions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PendingActions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PendingActions
    **/
    _count?: true | PendingActionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PendingActionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PendingActionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PendingActionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PendingActionMaxAggregateInputType
  }

  export type GetPendingActionAggregateType<T extends PendingActionAggregateArgs> = {
        [P in keyof T & keyof AggregatePendingAction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePendingAction[P]>
      : GetScalarType<T[P], AggregatePendingAction[P]>
  }




  export type PendingActionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PendingActionWhereInput
    orderBy?: PendingActionOrderByWithAggregationInput | PendingActionOrderByWithAggregationInput[]
    by: PendingActionScalarFieldEnum[] | PendingActionScalarFieldEnum
    having?: PendingActionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PendingActionCountAggregateInputType | true
    _avg?: PendingActionAvgAggregateInputType
    _sum?: PendingActionSumAggregateInputType
    _min?: PendingActionMinAggregateInputType
    _max?: PendingActionMaxAggregateInputType
  }

  export type PendingActionGroupByOutputType = {
    id: string
    signalId: string
    agent: string
    actionType: string
    actionPayload: JsonValue
    rationale: string
    expectedOutcome: string
    confidence: number
    riskLevel: $Enums.RiskLevel
    classification: $Enums.ActionClass
    status: $Enums.ActionStatus
    guardrailRule: string | null
    approvalToken: string | null
    approvedBy: string | null
    approvedAt: Date | null
    rejectedReason: string | null
    rejectedAt: Date | null
    executedAt: Date | null
    executionResult: JsonValue | null
    executionError: string | null
    expiresAt: Date
    createdAt: Date
    updatedAt: Date
    _count: PendingActionCountAggregateOutputType | null
    _avg: PendingActionAvgAggregateOutputType | null
    _sum: PendingActionSumAggregateOutputType | null
    _min: PendingActionMinAggregateOutputType | null
    _max: PendingActionMaxAggregateOutputType | null
  }

  type GetPendingActionGroupByPayload<T extends PendingActionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PendingActionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PendingActionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PendingActionGroupByOutputType[P]>
            : GetScalarType<T[P], PendingActionGroupByOutputType[P]>
        }
      >
    >


  export type PendingActionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    signalId?: boolean
    agent?: boolean
    actionType?: boolean
    actionPayload?: boolean
    rationale?: boolean
    expectedOutcome?: boolean
    confidence?: boolean
    riskLevel?: boolean
    classification?: boolean
    status?: boolean
    guardrailRule?: boolean
    approvalToken?: boolean
    approvedBy?: boolean
    approvedAt?: boolean
    rejectedReason?: boolean
    rejectedAt?: boolean
    executedAt?: boolean
    executionResult?: boolean
    executionError?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pendingAction"]>

  export type PendingActionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    signalId?: boolean
    agent?: boolean
    actionType?: boolean
    actionPayload?: boolean
    rationale?: boolean
    expectedOutcome?: boolean
    confidence?: boolean
    riskLevel?: boolean
    classification?: boolean
    status?: boolean
    guardrailRule?: boolean
    approvalToken?: boolean
    approvedBy?: boolean
    approvedAt?: boolean
    rejectedReason?: boolean
    rejectedAt?: boolean
    executedAt?: boolean
    executionResult?: boolean
    executionError?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pendingAction"]>

  export type PendingActionSelectScalar = {
    id?: boolean
    signalId?: boolean
    agent?: boolean
    actionType?: boolean
    actionPayload?: boolean
    rationale?: boolean
    expectedOutcome?: boolean
    confidence?: boolean
    riskLevel?: boolean
    classification?: boolean
    status?: boolean
    guardrailRule?: boolean
    approvalToken?: boolean
    approvedBy?: boolean
    approvedAt?: boolean
    rejectedReason?: boolean
    rejectedAt?: boolean
    executedAt?: boolean
    executionResult?: boolean
    executionError?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PendingActionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }
  export type PendingActionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    signal?: boolean | SignalDefaultArgs<ExtArgs>
  }

  export type $PendingActionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PendingAction"
    objects: {
      signal: Prisma.$SignalPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      signalId: string
      agent: string
      actionType: string
      actionPayload: Prisma.JsonValue
      rationale: string
      expectedOutcome: string
      confidence: number
      riskLevel: $Enums.RiskLevel
      classification: $Enums.ActionClass
      status: $Enums.ActionStatus
      guardrailRule: string | null
      approvalToken: string | null
      approvedBy: string | null
      approvedAt: Date | null
      rejectedReason: string | null
      rejectedAt: Date | null
      executedAt: Date | null
      executionResult: Prisma.JsonValue | null
      executionError: string | null
      expiresAt: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["pendingAction"]>
    composites: {}
  }

  type PendingActionGetPayload<S extends boolean | null | undefined | PendingActionDefaultArgs> = $Result.GetResult<Prisma.$PendingActionPayload, S>

  type PendingActionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PendingActionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PendingActionCountAggregateInputType | true
    }

  export interface PendingActionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PendingAction'], meta: { name: 'PendingAction' } }
    /**
     * Find zero or one PendingAction that matches the filter.
     * @param {PendingActionFindUniqueArgs} args - Arguments to find a PendingAction
     * @example
     * // Get one PendingAction
     * const pendingAction = await prisma.pendingAction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PendingActionFindUniqueArgs>(args: SelectSubset<T, PendingActionFindUniqueArgs<ExtArgs>>): Prisma__PendingActionClient<$Result.GetResult<Prisma.$PendingActionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PendingAction that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PendingActionFindUniqueOrThrowArgs} args - Arguments to find a PendingAction
     * @example
     * // Get one PendingAction
     * const pendingAction = await prisma.pendingAction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PendingActionFindUniqueOrThrowArgs>(args: SelectSubset<T, PendingActionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PendingActionClient<$Result.GetResult<Prisma.$PendingActionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PendingAction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingActionFindFirstArgs} args - Arguments to find a PendingAction
     * @example
     * // Get one PendingAction
     * const pendingAction = await prisma.pendingAction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PendingActionFindFirstArgs>(args?: SelectSubset<T, PendingActionFindFirstArgs<ExtArgs>>): Prisma__PendingActionClient<$Result.GetResult<Prisma.$PendingActionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PendingAction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingActionFindFirstOrThrowArgs} args - Arguments to find a PendingAction
     * @example
     * // Get one PendingAction
     * const pendingAction = await prisma.pendingAction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PendingActionFindFirstOrThrowArgs>(args?: SelectSubset<T, PendingActionFindFirstOrThrowArgs<ExtArgs>>): Prisma__PendingActionClient<$Result.GetResult<Prisma.$PendingActionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PendingActions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingActionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PendingActions
     * const pendingActions = await prisma.pendingAction.findMany()
     * 
     * // Get first 10 PendingActions
     * const pendingActions = await prisma.pendingAction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pendingActionWithIdOnly = await prisma.pendingAction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PendingActionFindManyArgs>(args?: SelectSubset<T, PendingActionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PendingActionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PendingAction.
     * @param {PendingActionCreateArgs} args - Arguments to create a PendingAction.
     * @example
     * // Create one PendingAction
     * const PendingAction = await prisma.pendingAction.create({
     *   data: {
     *     // ... data to create a PendingAction
     *   }
     * })
     * 
     */
    create<T extends PendingActionCreateArgs>(args: SelectSubset<T, PendingActionCreateArgs<ExtArgs>>): Prisma__PendingActionClient<$Result.GetResult<Prisma.$PendingActionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PendingActions.
     * @param {PendingActionCreateManyArgs} args - Arguments to create many PendingActions.
     * @example
     * // Create many PendingActions
     * const pendingAction = await prisma.pendingAction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PendingActionCreateManyArgs>(args?: SelectSubset<T, PendingActionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PendingActions and returns the data saved in the database.
     * @param {PendingActionCreateManyAndReturnArgs} args - Arguments to create many PendingActions.
     * @example
     * // Create many PendingActions
     * const pendingAction = await prisma.pendingAction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PendingActions and only return the `id`
     * const pendingActionWithIdOnly = await prisma.pendingAction.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PendingActionCreateManyAndReturnArgs>(args?: SelectSubset<T, PendingActionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PendingActionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PendingAction.
     * @param {PendingActionDeleteArgs} args - Arguments to delete one PendingAction.
     * @example
     * // Delete one PendingAction
     * const PendingAction = await prisma.pendingAction.delete({
     *   where: {
     *     // ... filter to delete one PendingAction
     *   }
     * })
     * 
     */
    delete<T extends PendingActionDeleteArgs>(args: SelectSubset<T, PendingActionDeleteArgs<ExtArgs>>): Prisma__PendingActionClient<$Result.GetResult<Prisma.$PendingActionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PendingAction.
     * @param {PendingActionUpdateArgs} args - Arguments to update one PendingAction.
     * @example
     * // Update one PendingAction
     * const pendingAction = await prisma.pendingAction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PendingActionUpdateArgs>(args: SelectSubset<T, PendingActionUpdateArgs<ExtArgs>>): Prisma__PendingActionClient<$Result.GetResult<Prisma.$PendingActionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PendingActions.
     * @param {PendingActionDeleteManyArgs} args - Arguments to filter PendingActions to delete.
     * @example
     * // Delete a few PendingActions
     * const { count } = await prisma.pendingAction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PendingActionDeleteManyArgs>(args?: SelectSubset<T, PendingActionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PendingActions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingActionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PendingActions
     * const pendingAction = await prisma.pendingAction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PendingActionUpdateManyArgs>(args: SelectSubset<T, PendingActionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PendingAction.
     * @param {PendingActionUpsertArgs} args - Arguments to update or create a PendingAction.
     * @example
     * // Update or create a PendingAction
     * const pendingAction = await prisma.pendingAction.upsert({
     *   create: {
     *     // ... data to create a PendingAction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PendingAction we want to update
     *   }
     * })
     */
    upsert<T extends PendingActionUpsertArgs>(args: SelectSubset<T, PendingActionUpsertArgs<ExtArgs>>): Prisma__PendingActionClient<$Result.GetResult<Prisma.$PendingActionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PendingActions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingActionCountArgs} args - Arguments to filter PendingActions to count.
     * @example
     * // Count the number of PendingActions
     * const count = await prisma.pendingAction.count({
     *   where: {
     *     // ... the filter for the PendingActions we want to count
     *   }
     * })
    **/
    count<T extends PendingActionCountArgs>(
      args?: Subset<T, PendingActionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PendingActionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PendingAction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingActionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PendingActionAggregateArgs>(args: Subset<T, PendingActionAggregateArgs>): Prisma.PrismaPromise<GetPendingActionAggregateType<T>>

    /**
     * Group by PendingAction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingActionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PendingActionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PendingActionGroupByArgs['orderBy'] }
        : { orderBy?: PendingActionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PendingActionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPendingActionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PendingAction model
   */
  readonly fields: PendingActionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PendingAction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PendingActionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    signal<T extends SignalDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SignalDefaultArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PendingAction model
   */ 
  interface PendingActionFieldRefs {
    readonly id: FieldRef<"PendingAction", 'String'>
    readonly signalId: FieldRef<"PendingAction", 'String'>
    readonly agent: FieldRef<"PendingAction", 'String'>
    readonly actionType: FieldRef<"PendingAction", 'String'>
    readonly actionPayload: FieldRef<"PendingAction", 'Json'>
    readonly rationale: FieldRef<"PendingAction", 'String'>
    readonly expectedOutcome: FieldRef<"PendingAction", 'String'>
    readonly confidence: FieldRef<"PendingAction", 'Float'>
    readonly riskLevel: FieldRef<"PendingAction", 'RiskLevel'>
    readonly classification: FieldRef<"PendingAction", 'ActionClass'>
    readonly status: FieldRef<"PendingAction", 'ActionStatus'>
    readonly guardrailRule: FieldRef<"PendingAction", 'String'>
    readonly approvalToken: FieldRef<"PendingAction", 'String'>
    readonly approvedBy: FieldRef<"PendingAction", 'String'>
    readonly approvedAt: FieldRef<"PendingAction", 'DateTime'>
    readonly rejectedReason: FieldRef<"PendingAction", 'String'>
    readonly rejectedAt: FieldRef<"PendingAction", 'DateTime'>
    readonly executedAt: FieldRef<"PendingAction", 'DateTime'>
    readonly executionResult: FieldRef<"PendingAction", 'Json'>
    readonly executionError: FieldRef<"PendingAction", 'String'>
    readonly expiresAt: FieldRef<"PendingAction", 'DateTime'>
    readonly createdAt: FieldRef<"PendingAction", 'DateTime'>
    readonly updatedAt: FieldRef<"PendingAction", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PendingAction findUnique
   */
  export type PendingActionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingAction
     */
    select?: PendingActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingActionInclude<ExtArgs> | null
    /**
     * Filter, which PendingAction to fetch.
     */
    where: PendingActionWhereUniqueInput
  }

  /**
   * PendingAction findUniqueOrThrow
   */
  export type PendingActionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingAction
     */
    select?: PendingActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingActionInclude<ExtArgs> | null
    /**
     * Filter, which PendingAction to fetch.
     */
    where: PendingActionWhereUniqueInput
  }

  /**
   * PendingAction findFirst
   */
  export type PendingActionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingAction
     */
    select?: PendingActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingActionInclude<ExtArgs> | null
    /**
     * Filter, which PendingAction to fetch.
     */
    where?: PendingActionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PendingActions to fetch.
     */
    orderBy?: PendingActionOrderByWithRelationInput | PendingActionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PendingActions.
     */
    cursor?: PendingActionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PendingActions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PendingActions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PendingActions.
     */
    distinct?: PendingActionScalarFieldEnum | PendingActionScalarFieldEnum[]
  }

  /**
   * PendingAction findFirstOrThrow
   */
  export type PendingActionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingAction
     */
    select?: PendingActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingActionInclude<ExtArgs> | null
    /**
     * Filter, which PendingAction to fetch.
     */
    where?: PendingActionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PendingActions to fetch.
     */
    orderBy?: PendingActionOrderByWithRelationInput | PendingActionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PendingActions.
     */
    cursor?: PendingActionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PendingActions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PendingActions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PendingActions.
     */
    distinct?: PendingActionScalarFieldEnum | PendingActionScalarFieldEnum[]
  }

  /**
   * PendingAction findMany
   */
  export type PendingActionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingAction
     */
    select?: PendingActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingActionInclude<ExtArgs> | null
    /**
     * Filter, which PendingActions to fetch.
     */
    where?: PendingActionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PendingActions to fetch.
     */
    orderBy?: PendingActionOrderByWithRelationInput | PendingActionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PendingActions.
     */
    cursor?: PendingActionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PendingActions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PendingActions.
     */
    skip?: number
    distinct?: PendingActionScalarFieldEnum | PendingActionScalarFieldEnum[]
  }

  /**
   * PendingAction create
   */
  export type PendingActionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingAction
     */
    select?: PendingActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingActionInclude<ExtArgs> | null
    /**
     * The data needed to create a PendingAction.
     */
    data: XOR<PendingActionCreateInput, PendingActionUncheckedCreateInput>
  }

  /**
   * PendingAction createMany
   */
  export type PendingActionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PendingActions.
     */
    data: PendingActionCreateManyInput | PendingActionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PendingAction createManyAndReturn
   */
  export type PendingActionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingAction
     */
    select?: PendingActionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PendingActions.
     */
    data: PendingActionCreateManyInput | PendingActionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingActionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PendingAction update
   */
  export type PendingActionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingAction
     */
    select?: PendingActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingActionInclude<ExtArgs> | null
    /**
     * The data needed to update a PendingAction.
     */
    data: XOR<PendingActionUpdateInput, PendingActionUncheckedUpdateInput>
    /**
     * Choose, which PendingAction to update.
     */
    where: PendingActionWhereUniqueInput
  }

  /**
   * PendingAction updateMany
   */
  export type PendingActionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PendingActions.
     */
    data: XOR<PendingActionUpdateManyMutationInput, PendingActionUncheckedUpdateManyInput>
    /**
     * Filter which PendingActions to update
     */
    where?: PendingActionWhereInput
  }

  /**
   * PendingAction upsert
   */
  export type PendingActionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingAction
     */
    select?: PendingActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingActionInclude<ExtArgs> | null
    /**
     * The filter to search for the PendingAction to update in case it exists.
     */
    where: PendingActionWhereUniqueInput
    /**
     * In case the PendingAction found by the `where` argument doesn't exist, create a new PendingAction with this data.
     */
    create: XOR<PendingActionCreateInput, PendingActionUncheckedCreateInput>
    /**
     * In case the PendingAction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PendingActionUpdateInput, PendingActionUncheckedUpdateInput>
  }

  /**
   * PendingAction delete
   */
  export type PendingActionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingAction
     */
    select?: PendingActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingActionInclude<ExtArgs> | null
    /**
     * Filter which PendingAction to delete.
     */
    where: PendingActionWhereUniqueInput
  }

  /**
   * PendingAction deleteMany
   */
  export type PendingActionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PendingActions to delete
     */
    where?: PendingActionWhereInput
  }

  /**
   * PendingAction without action
   */
  export type PendingActionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingAction
     */
    select?: PendingActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingActionInclude<ExtArgs> | null
  }


  /**
   * Model InsightOutcome
   */

  export type AggregateInsightOutcome = {
    _count: InsightOutcomeCountAggregateOutputType | null
    _avg: InsightOutcomeAvgAggregateOutputType | null
    _sum: InsightOutcomeSumAggregateOutputType | null
    _min: InsightOutcomeMinAggregateOutputType | null
    _max: InsightOutcomeMaxAggregateOutputType | null
  }

  export type InsightOutcomeAvgAggregateOutputType = {
    windowHours: number | null
    outcomeScore: number | null
  }

  export type InsightOutcomeSumAggregateOutputType = {
    windowHours: number | null
    outcomeScore: number | null
  }

  export type InsightOutcomeMinAggregateOutputType = {
    id: string | null
    insightId: string | null
    measuredAt: Date | null
    windowHours: number | null
    outcomeScore: number | null
    createdAt: Date | null
  }

  export type InsightOutcomeMaxAggregateOutputType = {
    id: string | null
    insightId: string | null
    measuredAt: Date | null
    windowHours: number | null
    outcomeScore: number | null
    createdAt: Date | null
  }

  export type InsightOutcomeCountAggregateOutputType = {
    id: number
    insightId: number
    measuredAt: number
    windowHours: number
    metricDeltas: number
    outcomeScore: number
    createdAt: number
    _all: number
  }


  export type InsightOutcomeAvgAggregateInputType = {
    windowHours?: true
    outcomeScore?: true
  }

  export type InsightOutcomeSumAggregateInputType = {
    windowHours?: true
    outcomeScore?: true
  }

  export type InsightOutcomeMinAggregateInputType = {
    id?: true
    insightId?: true
    measuredAt?: true
    windowHours?: true
    outcomeScore?: true
    createdAt?: true
  }

  export type InsightOutcomeMaxAggregateInputType = {
    id?: true
    insightId?: true
    measuredAt?: true
    windowHours?: true
    outcomeScore?: true
    createdAt?: true
  }

  export type InsightOutcomeCountAggregateInputType = {
    id?: true
    insightId?: true
    measuredAt?: true
    windowHours?: true
    metricDeltas?: true
    outcomeScore?: true
    createdAt?: true
    _all?: true
  }

  export type InsightOutcomeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InsightOutcome to aggregate.
     */
    where?: InsightOutcomeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InsightOutcomes to fetch.
     */
    orderBy?: InsightOutcomeOrderByWithRelationInput | InsightOutcomeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InsightOutcomeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InsightOutcomes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InsightOutcomes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InsightOutcomes
    **/
    _count?: true | InsightOutcomeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InsightOutcomeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InsightOutcomeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InsightOutcomeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InsightOutcomeMaxAggregateInputType
  }

  export type GetInsightOutcomeAggregateType<T extends InsightOutcomeAggregateArgs> = {
        [P in keyof T & keyof AggregateInsightOutcome]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInsightOutcome[P]>
      : GetScalarType<T[P], AggregateInsightOutcome[P]>
  }




  export type InsightOutcomeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InsightOutcomeWhereInput
    orderBy?: InsightOutcomeOrderByWithAggregationInput | InsightOutcomeOrderByWithAggregationInput[]
    by: InsightOutcomeScalarFieldEnum[] | InsightOutcomeScalarFieldEnum
    having?: InsightOutcomeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InsightOutcomeCountAggregateInputType | true
    _avg?: InsightOutcomeAvgAggregateInputType
    _sum?: InsightOutcomeSumAggregateInputType
    _min?: InsightOutcomeMinAggregateInputType
    _max?: InsightOutcomeMaxAggregateInputType
  }

  export type InsightOutcomeGroupByOutputType = {
    id: string
    insightId: string
    measuredAt: Date
    windowHours: number
    metricDeltas: JsonValue
    outcomeScore: number
    createdAt: Date
    _count: InsightOutcomeCountAggregateOutputType | null
    _avg: InsightOutcomeAvgAggregateOutputType | null
    _sum: InsightOutcomeSumAggregateOutputType | null
    _min: InsightOutcomeMinAggregateOutputType | null
    _max: InsightOutcomeMaxAggregateOutputType | null
  }

  type GetInsightOutcomeGroupByPayload<T extends InsightOutcomeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InsightOutcomeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InsightOutcomeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InsightOutcomeGroupByOutputType[P]>
            : GetScalarType<T[P], InsightOutcomeGroupByOutputType[P]>
        }
      >
    >


  export type InsightOutcomeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    insightId?: boolean
    measuredAt?: boolean
    windowHours?: boolean
    metricDeltas?: boolean
    outcomeScore?: boolean
    createdAt?: boolean
    insight?: boolean | InsightDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["insightOutcome"]>

  export type InsightOutcomeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    insightId?: boolean
    measuredAt?: boolean
    windowHours?: boolean
    metricDeltas?: boolean
    outcomeScore?: boolean
    createdAt?: boolean
    insight?: boolean | InsightDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["insightOutcome"]>

  export type InsightOutcomeSelectScalar = {
    id?: boolean
    insightId?: boolean
    measuredAt?: boolean
    windowHours?: boolean
    metricDeltas?: boolean
    outcomeScore?: boolean
    createdAt?: boolean
  }

  export type InsightOutcomeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    insight?: boolean | InsightDefaultArgs<ExtArgs>
  }
  export type InsightOutcomeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    insight?: boolean | InsightDefaultArgs<ExtArgs>
  }

  export type $InsightOutcomePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InsightOutcome"
    objects: {
      insight: Prisma.$InsightPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      insightId: string
      measuredAt: Date
      windowHours: number
      metricDeltas: Prisma.JsonValue
      outcomeScore: number
      createdAt: Date
    }, ExtArgs["result"]["insightOutcome"]>
    composites: {}
  }

  type InsightOutcomeGetPayload<S extends boolean | null | undefined | InsightOutcomeDefaultArgs> = $Result.GetResult<Prisma.$InsightOutcomePayload, S>

  type InsightOutcomeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<InsightOutcomeFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: InsightOutcomeCountAggregateInputType | true
    }

  export interface InsightOutcomeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InsightOutcome'], meta: { name: 'InsightOutcome' } }
    /**
     * Find zero or one InsightOutcome that matches the filter.
     * @param {InsightOutcomeFindUniqueArgs} args - Arguments to find a InsightOutcome
     * @example
     * // Get one InsightOutcome
     * const insightOutcome = await prisma.insightOutcome.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InsightOutcomeFindUniqueArgs>(args: SelectSubset<T, InsightOutcomeFindUniqueArgs<ExtArgs>>): Prisma__InsightOutcomeClient<$Result.GetResult<Prisma.$InsightOutcomePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one InsightOutcome that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {InsightOutcomeFindUniqueOrThrowArgs} args - Arguments to find a InsightOutcome
     * @example
     * // Get one InsightOutcome
     * const insightOutcome = await prisma.insightOutcome.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InsightOutcomeFindUniqueOrThrowArgs>(args: SelectSubset<T, InsightOutcomeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InsightOutcomeClient<$Result.GetResult<Prisma.$InsightOutcomePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first InsightOutcome that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsightOutcomeFindFirstArgs} args - Arguments to find a InsightOutcome
     * @example
     * // Get one InsightOutcome
     * const insightOutcome = await prisma.insightOutcome.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InsightOutcomeFindFirstArgs>(args?: SelectSubset<T, InsightOutcomeFindFirstArgs<ExtArgs>>): Prisma__InsightOutcomeClient<$Result.GetResult<Prisma.$InsightOutcomePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first InsightOutcome that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsightOutcomeFindFirstOrThrowArgs} args - Arguments to find a InsightOutcome
     * @example
     * // Get one InsightOutcome
     * const insightOutcome = await prisma.insightOutcome.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InsightOutcomeFindFirstOrThrowArgs>(args?: SelectSubset<T, InsightOutcomeFindFirstOrThrowArgs<ExtArgs>>): Prisma__InsightOutcomeClient<$Result.GetResult<Prisma.$InsightOutcomePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more InsightOutcomes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsightOutcomeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InsightOutcomes
     * const insightOutcomes = await prisma.insightOutcome.findMany()
     * 
     * // Get first 10 InsightOutcomes
     * const insightOutcomes = await prisma.insightOutcome.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const insightOutcomeWithIdOnly = await prisma.insightOutcome.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InsightOutcomeFindManyArgs>(args?: SelectSubset<T, InsightOutcomeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InsightOutcomePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a InsightOutcome.
     * @param {InsightOutcomeCreateArgs} args - Arguments to create a InsightOutcome.
     * @example
     * // Create one InsightOutcome
     * const InsightOutcome = await prisma.insightOutcome.create({
     *   data: {
     *     // ... data to create a InsightOutcome
     *   }
     * })
     * 
     */
    create<T extends InsightOutcomeCreateArgs>(args: SelectSubset<T, InsightOutcomeCreateArgs<ExtArgs>>): Prisma__InsightOutcomeClient<$Result.GetResult<Prisma.$InsightOutcomePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many InsightOutcomes.
     * @param {InsightOutcomeCreateManyArgs} args - Arguments to create many InsightOutcomes.
     * @example
     * // Create many InsightOutcomes
     * const insightOutcome = await prisma.insightOutcome.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InsightOutcomeCreateManyArgs>(args?: SelectSubset<T, InsightOutcomeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InsightOutcomes and returns the data saved in the database.
     * @param {InsightOutcomeCreateManyAndReturnArgs} args - Arguments to create many InsightOutcomes.
     * @example
     * // Create many InsightOutcomes
     * const insightOutcome = await prisma.insightOutcome.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InsightOutcomes and only return the `id`
     * const insightOutcomeWithIdOnly = await prisma.insightOutcome.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InsightOutcomeCreateManyAndReturnArgs>(args?: SelectSubset<T, InsightOutcomeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InsightOutcomePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a InsightOutcome.
     * @param {InsightOutcomeDeleteArgs} args - Arguments to delete one InsightOutcome.
     * @example
     * // Delete one InsightOutcome
     * const InsightOutcome = await prisma.insightOutcome.delete({
     *   where: {
     *     // ... filter to delete one InsightOutcome
     *   }
     * })
     * 
     */
    delete<T extends InsightOutcomeDeleteArgs>(args: SelectSubset<T, InsightOutcomeDeleteArgs<ExtArgs>>): Prisma__InsightOutcomeClient<$Result.GetResult<Prisma.$InsightOutcomePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one InsightOutcome.
     * @param {InsightOutcomeUpdateArgs} args - Arguments to update one InsightOutcome.
     * @example
     * // Update one InsightOutcome
     * const insightOutcome = await prisma.insightOutcome.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InsightOutcomeUpdateArgs>(args: SelectSubset<T, InsightOutcomeUpdateArgs<ExtArgs>>): Prisma__InsightOutcomeClient<$Result.GetResult<Prisma.$InsightOutcomePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more InsightOutcomes.
     * @param {InsightOutcomeDeleteManyArgs} args - Arguments to filter InsightOutcomes to delete.
     * @example
     * // Delete a few InsightOutcomes
     * const { count } = await prisma.insightOutcome.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InsightOutcomeDeleteManyArgs>(args?: SelectSubset<T, InsightOutcomeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InsightOutcomes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsightOutcomeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InsightOutcomes
     * const insightOutcome = await prisma.insightOutcome.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InsightOutcomeUpdateManyArgs>(args: SelectSubset<T, InsightOutcomeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one InsightOutcome.
     * @param {InsightOutcomeUpsertArgs} args - Arguments to update or create a InsightOutcome.
     * @example
     * // Update or create a InsightOutcome
     * const insightOutcome = await prisma.insightOutcome.upsert({
     *   create: {
     *     // ... data to create a InsightOutcome
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InsightOutcome we want to update
     *   }
     * })
     */
    upsert<T extends InsightOutcomeUpsertArgs>(args: SelectSubset<T, InsightOutcomeUpsertArgs<ExtArgs>>): Prisma__InsightOutcomeClient<$Result.GetResult<Prisma.$InsightOutcomePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of InsightOutcomes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsightOutcomeCountArgs} args - Arguments to filter InsightOutcomes to count.
     * @example
     * // Count the number of InsightOutcomes
     * const count = await prisma.insightOutcome.count({
     *   where: {
     *     // ... the filter for the InsightOutcomes we want to count
     *   }
     * })
    **/
    count<T extends InsightOutcomeCountArgs>(
      args?: Subset<T, InsightOutcomeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InsightOutcomeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InsightOutcome.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsightOutcomeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InsightOutcomeAggregateArgs>(args: Subset<T, InsightOutcomeAggregateArgs>): Prisma.PrismaPromise<GetInsightOutcomeAggregateType<T>>

    /**
     * Group by InsightOutcome.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsightOutcomeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InsightOutcomeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InsightOutcomeGroupByArgs['orderBy'] }
        : { orderBy?: InsightOutcomeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InsightOutcomeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInsightOutcomeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InsightOutcome model
   */
  readonly fields: InsightOutcomeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InsightOutcome.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InsightOutcomeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    insight<T extends InsightDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InsightDefaultArgs<ExtArgs>>): Prisma__InsightClient<$Result.GetResult<Prisma.$InsightPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the InsightOutcome model
   */ 
  interface InsightOutcomeFieldRefs {
    readonly id: FieldRef<"InsightOutcome", 'String'>
    readonly insightId: FieldRef<"InsightOutcome", 'String'>
    readonly measuredAt: FieldRef<"InsightOutcome", 'DateTime'>
    readonly windowHours: FieldRef<"InsightOutcome", 'Int'>
    readonly metricDeltas: FieldRef<"InsightOutcome", 'Json'>
    readonly outcomeScore: FieldRef<"InsightOutcome", 'Float'>
    readonly createdAt: FieldRef<"InsightOutcome", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InsightOutcome findUnique
   */
  export type InsightOutcomeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InsightOutcome
     */
    select?: InsightOutcomeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightOutcomeInclude<ExtArgs> | null
    /**
     * Filter, which InsightOutcome to fetch.
     */
    where: InsightOutcomeWhereUniqueInput
  }

  /**
   * InsightOutcome findUniqueOrThrow
   */
  export type InsightOutcomeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InsightOutcome
     */
    select?: InsightOutcomeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightOutcomeInclude<ExtArgs> | null
    /**
     * Filter, which InsightOutcome to fetch.
     */
    where: InsightOutcomeWhereUniqueInput
  }

  /**
   * InsightOutcome findFirst
   */
  export type InsightOutcomeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InsightOutcome
     */
    select?: InsightOutcomeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightOutcomeInclude<ExtArgs> | null
    /**
     * Filter, which InsightOutcome to fetch.
     */
    where?: InsightOutcomeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InsightOutcomes to fetch.
     */
    orderBy?: InsightOutcomeOrderByWithRelationInput | InsightOutcomeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InsightOutcomes.
     */
    cursor?: InsightOutcomeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InsightOutcomes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InsightOutcomes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InsightOutcomes.
     */
    distinct?: InsightOutcomeScalarFieldEnum | InsightOutcomeScalarFieldEnum[]
  }

  /**
   * InsightOutcome findFirstOrThrow
   */
  export type InsightOutcomeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InsightOutcome
     */
    select?: InsightOutcomeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightOutcomeInclude<ExtArgs> | null
    /**
     * Filter, which InsightOutcome to fetch.
     */
    where?: InsightOutcomeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InsightOutcomes to fetch.
     */
    orderBy?: InsightOutcomeOrderByWithRelationInput | InsightOutcomeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InsightOutcomes.
     */
    cursor?: InsightOutcomeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InsightOutcomes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InsightOutcomes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InsightOutcomes.
     */
    distinct?: InsightOutcomeScalarFieldEnum | InsightOutcomeScalarFieldEnum[]
  }

  /**
   * InsightOutcome findMany
   */
  export type InsightOutcomeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InsightOutcome
     */
    select?: InsightOutcomeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightOutcomeInclude<ExtArgs> | null
    /**
     * Filter, which InsightOutcomes to fetch.
     */
    where?: InsightOutcomeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InsightOutcomes to fetch.
     */
    orderBy?: InsightOutcomeOrderByWithRelationInput | InsightOutcomeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InsightOutcomes.
     */
    cursor?: InsightOutcomeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InsightOutcomes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InsightOutcomes.
     */
    skip?: number
    distinct?: InsightOutcomeScalarFieldEnum | InsightOutcomeScalarFieldEnum[]
  }

  /**
   * InsightOutcome create
   */
  export type InsightOutcomeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InsightOutcome
     */
    select?: InsightOutcomeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightOutcomeInclude<ExtArgs> | null
    /**
     * The data needed to create a InsightOutcome.
     */
    data: XOR<InsightOutcomeCreateInput, InsightOutcomeUncheckedCreateInput>
  }

  /**
   * InsightOutcome createMany
   */
  export type InsightOutcomeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InsightOutcomes.
     */
    data: InsightOutcomeCreateManyInput | InsightOutcomeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InsightOutcome createManyAndReturn
   */
  export type InsightOutcomeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InsightOutcome
     */
    select?: InsightOutcomeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many InsightOutcomes.
     */
    data: InsightOutcomeCreateManyInput | InsightOutcomeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightOutcomeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * InsightOutcome update
   */
  export type InsightOutcomeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InsightOutcome
     */
    select?: InsightOutcomeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightOutcomeInclude<ExtArgs> | null
    /**
     * The data needed to update a InsightOutcome.
     */
    data: XOR<InsightOutcomeUpdateInput, InsightOutcomeUncheckedUpdateInput>
    /**
     * Choose, which InsightOutcome to update.
     */
    where: InsightOutcomeWhereUniqueInput
  }

  /**
   * InsightOutcome updateMany
   */
  export type InsightOutcomeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InsightOutcomes.
     */
    data: XOR<InsightOutcomeUpdateManyMutationInput, InsightOutcomeUncheckedUpdateManyInput>
    /**
     * Filter which InsightOutcomes to update
     */
    where?: InsightOutcomeWhereInput
  }

  /**
   * InsightOutcome upsert
   */
  export type InsightOutcomeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InsightOutcome
     */
    select?: InsightOutcomeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightOutcomeInclude<ExtArgs> | null
    /**
     * The filter to search for the InsightOutcome to update in case it exists.
     */
    where: InsightOutcomeWhereUniqueInput
    /**
     * In case the InsightOutcome found by the `where` argument doesn't exist, create a new InsightOutcome with this data.
     */
    create: XOR<InsightOutcomeCreateInput, InsightOutcomeUncheckedCreateInput>
    /**
     * In case the InsightOutcome was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InsightOutcomeUpdateInput, InsightOutcomeUncheckedUpdateInput>
  }

  /**
   * InsightOutcome delete
   */
  export type InsightOutcomeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InsightOutcome
     */
    select?: InsightOutcomeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightOutcomeInclude<ExtArgs> | null
    /**
     * Filter which InsightOutcome to delete.
     */
    where: InsightOutcomeWhereUniqueInput
  }

  /**
   * InsightOutcome deleteMany
   */
  export type InsightOutcomeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InsightOutcomes to delete
     */
    where?: InsightOutcomeWhereInput
  }

  /**
   * InsightOutcome without action
   */
  export type InsightOutcomeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InsightOutcome
     */
    select?: InsightOutcomeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsightOutcomeInclude<ExtArgs> | null
  }


  /**
   * Model AuditLog
   */

  export type AggregateAuditLog = {
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  export type AuditLogMinAggregateOutputType = {
    id: string | null
    signalId: string | null
    event: string | null
    actor: string | null
    createdAt: Date | null
  }

  export type AuditLogMaxAggregateOutputType = {
    id: string | null
    signalId: string | null
    event: string | null
    actor: string | null
    createdAt: Date | null
  }

  export type AuditLogCountAggregateOutputType = {
    id: number
    signalId: number
    event: number
    actor: number
    payload: number
    createdAt: number
    _all: number
  }


  export type AuditLogMinAggregateInputType = {
    id?: true
    signalId?: true
    event?: true
    actor?: true
    createdAt?: true
  }

  export type AuditLogMaxAggregateInputType = {
    id?: true
    signalId?: true
    event?: true
    actor?: true
    createdAt?: true
  }

  export type AuditLogCountAggregateInputType = {
    id?: true
    signalId?: true
    event?: true
    actor?: true
    payload?: true
    createdAt?: true
    _all?: true
  }

  export type AuditLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLog to aggregate.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditLogs
    **/
    _count?: true | AuditLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditLogMaxAggregateInputType
  }

  export type GetAuditLogAggregateType<T extends AuditLogAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditLog[P]>
      : GetScalarType<T[P], AggregateAuditLog[P]>
  }




  export type AuditLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithAggregationInput | AuditLogOrderByWithAggregationInput[]
    by: AuditLogScalarFieldEnum[] | AuditLogScalarFieldEnum
    having?: AuditLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditLogCountAggregateInputType | true
    _min?: AuditLogMinAggregateInputType
    _max?: AuditLogMaxAggregateInputType
  }

  export type AuditLogGroupByOutputType = {
    id: string
    signalId: string | null
    event: string
    actor: string
    payload: JsonValue
    createdAt: Date
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  type GetAuditLogGroupByPayload<T extends AuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
        }
      >
    >


  export type AuditLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    signalId?: boolean
    event?: boolean
    actor?: boolean
    payload?: boolean
    createdAt?: boolean
    signal?: boolean | AuditLog$signalArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    signalId?: boolean
    event?: boolean
    actor?: boolean
    payload?: boolean
    createdAt?: boolean
    signal?: boolean | AuditLog$signalArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectScalar = {
    id?: boolean
    signalId?: boolean
    event?: boolean
    actor?: boolean
    payload?: boolean
    createdAt?: boolean
  }

  export type AuditLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    signal?: boolean | AuditLog$signalArgs<ExtArgs>
  }
  export type AuditLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    signal?: boolean | AuditLog$signalArgs<ExtArgs>
  }

  export type $AuditLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditLog"
    objects: {
      signal: Prisma.$SignalPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      signalId: string | null
      event: string
      actor: string
      payload: Prisma.JsonValue
      createdAt: Date
    }, ExtArgs["result"]["auditLog"]>
    composites: {}
  }

  type AuditLogGetPayload<S extends boolean | null | undefined | AuditLogDefaultArgs> = $Result.GetResult<Prisma.$AuditLogPayload, S>

  type AuditLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AuditLogFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AuditLogCountAggregateInputType | true
    }

  export interface AuditLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditLog'], meta: { name: 'AuditLog' } }
    /**
     * Find zero or one AuditLog that matches the filter.
     * @param {AuditLogFindUniqueArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditLogFindUniqueArgs>(args: SelectSubset<T, AuditLogFindUniqueArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AuditLog that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AuditLogFindUniqueOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditLogFindUniqueOrThrowArgs>(args: SelectSubset<T, AuditLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditLogFindFirstArgs>(args?: SelectSubset<T, AuditLogFindFirstArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditLogFindFirstOrThrowArgs>(args?: SelectSubset<T, AuditLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditLogs
     * const auditLogs = await prisma.auditLog.findMany()
     * 
     * // Get first 10 AuditLogs
     * const auditLogs = await prisma.auditLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuditLogFindManyArgs>(args?: SelectSubset<T, AuditLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AuditLog.
     * @param {AuditLogCreateArgs} args - Arguments to create a AuditLog.
     * @example
     * // Create one AuditLog
     * const AuditLog = await prisma.auditLog.create({
     *   data: {
     *     // ... data to create a AuditLog
     *   }
     * })
     * 
     */
    create<T extends AuditLogCreateArgs>(args: SelectSubset<T, AuditLogCreateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AuditLogs.
     * @param {AuditLogCreateManyArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuditLogCreateManyArgs>(args?: SelectSubset<T, AuditLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuditLogs and returns the data saved in the database.
     * @param {AuditLogCreateManyAndReturnArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuditLogCreateManyAndReturnArgs>(args?: SelectSubset<T, AuditLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AuditLog.
     * @param {AuditLogDeleteArgs} args - Arguments to delete one AuditLog.
     * @example
     * // Delete one AuditLog
     * const AuditLog = await prisma.auditLog.delete({
     *   where: {
     *     // ... filter to delete one AuditLog
     *   }
     * })
     * 
     */
    delete<T extends AuditLogDeleteArgs>(args: SelectSubset<T, AuditLogDeleteArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AuditLog.
     * @param {AuditLogUpdateArgs} args - Arguments to update one AuditLog.
     * @example
     * // Update one AuditLog
     * const auditLog = await prisma.auditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuditLogUpdateArgs>(args: SelectSubset<T, AuditLogUpdateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AuditLogs.
     * @param {AuditLogDeleteManyArgs} args - Arguments to filter AuditLogs to delete.
     * @example
     * // Delete a few AuditLogs
     * const { count } = await prisma.auditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuditLogDeleteManyArgs>(args?: SelectSubset<T, AuditLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuditLogUpdateManyArgs>(args: SelectSubset<T, AuditLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AuditLog.
     * @param {AuditLogUpsertArgs} args - Arguments to update or create a AuditLog.
     * @example
     * // Update or create a AuditLog
     * const auditLog = await prisma.auditLog.upsert({
     *   create: {
     *     // ... data to create a AuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditLog we want to update
     *   }
     * })
     */
    upsert<T extends AuditLogUpsertArgs>(args: SelectSubset<T, AuditLogUpsertArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogCountArgs} args - Arguments to filter AuditLogs to count.
     * @example
     * // Count the number of AuditLogs
     * const count = await prisma.auditLog.count({
     *   where: {
     *     // ... the filter for the AuditLogs we want to count
     *   }
     * })
    **/
    count<T extends AuditLogCountArgs>(
      args?: Subset<T, AuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuditLogAggregateArgs>(args: Subset<T, AuditLogAggregateArgs>): Prisma.PrismaPromise<GetAuditLogAggregateType<T>>

    /**
     * Group by AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditLogGroupByArgs['orderBy'] }
        : { orderBy?: AuditLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditLog model
   */
  readonly fields: AuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    signal<T extends AuditLog$signalArgs<ExtArgs> = {}>(args?: Subset<T, AuditLog$signalArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuditLog model
   */ 
  interface AuditLogFieldRefs {
    readonly id: FieldRef<"AuditLog", 'String'>
    readonly signalId: FieldRef<"AuditLog", 'String'>
    readonly event: FieldRef<"AuditLog", 'String'>
    readonly actor: FieldRef<"AuditLog", 'String'>
    readonly payload: FieldRef<"AuditLog", 'Json'>
    readonly createdAt: FieldRef<"AuditLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuditLog findUnique
   */
  export type AuditLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findUniqueOrThrow
   */
  export type AuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findFirst
   */
  export type AuditLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findFirstOrThrow
   */
  export type AuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findMany
   */
  export type AuditLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLogs to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog create
   */
  export type AuditLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to create a AuditLog.
     */
    data: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
  }

  /**
   * AuditLog createMany
   */
  export type AuditLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditLog createManyAndReturn
   */
  export type AuditLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuditLog update
   */
  export type AuditLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to update a AuditLog.
     */
    data: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
    /**
     * Choose, which AuditLog to update.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog updateMany
   */
  export type AuditLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
  }

  /**
   * AuditLog upsert
   */
  export type AuditLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The filter to search for the AuditLog to update in case it exists.
     */
    where: AuditLogWhereUniqueInput
    /**
     * In case the AuditLog found by the `where` argument doesn't exist, create a new AuditLog with this data.
     */
    create: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
    /**
     * In case the AuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
  }

  /**
   * AuditLog delete
   */
  export type AuditLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter which AuditLog to delete.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog deleteMany
   */
  export type AuditLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLogs to delete
     */
    where?: AuditLogWhereInput
  }

  /**
   * AuditLog.signal
   */
  export type AuditLog$signalArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    where?: SignalWhereInput
  }

  /**
   * AuditLog without action
   */
  export type AuditLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
  }


  /**
   * Model AgentConfig
   */

  export type AggregateAgentConfig = {
    _count: AgentConfigCountAggregateOutputType | null
    _min: AgentConfigMinAggregateOutputType | null
    _max: AgentConfigMaxAggregateOutputType | null
  }

  export type AgentConfigMinAggregateOutputType = {
    id: string | null
    agentName: string | null
    enabled: boolean | null
    updatedAt: Date | null
    updatedBy: string | null
  }

  export type AgentConfigMaxAggregateOutputType = {
    id: string | null
    agentName: string | null
    enabled: boolean | null
    updatedAt: Date | null
    updatedBy: string | null
  }

  export type AgentConfigCountAggregateOutputType = {
    id: number
    agentName: number
    enabled: number
    config: number
    updatedAt: number
    updatedBy: number
    _all: number
  }


  export type AgentConfigMinAggregateInputType = {
    id?: true
    agentName?: true
    enabled?: true
    updatedAt?: true
    updatedBy?: true
  }

  export type AgentConfigMaxAggregateInputType = {
    id?: true
    agentName?: true
    enabled?: true
    updatedAt?: true
    updatedBy?: true
  }

  export type AgentConfigCountAggregateInputType = {
    id?: true
    agentName?: true
    enabled?: true
    config?: true
    updatedAt?: true
    updatedBy?: true
    _all?: true
  }

  export type AgentConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentConfig to aggregate.
     */
    where?: AgentConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentConfigs to fetch.
     */
    orderBy?: AgentConfigOrderByWithRelationInput | AgentConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AgentConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AgentConfigs
    **/
    _count?: true | AgentConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AgentConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AgentConfigMaxAggregateInputType
  }

  export type GetAgentConfigAggregateType<T extends AgentConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateAgentConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAgentConfig[P]>
      : GetScalarType<T[P], AggregateAgentConfig[P]>
  }




  export type AgentConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentConfigWhereInput
    orderBy?: AgentConfigOrderByWithAggregationInput | AgentConfigOrderByWithAggregationInput[]
    by: AgentConfigScalarFieldEnum[] | AgentConfigScalarFieldEnum
    having?: AgentConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AgentConfigCountAggregateInputType | true
    _min?: AgentConfigMinAggregateInputType
    _max?: AgentConfigMaxAggregateInputType
  }

  export type AgentConfigGroupByOutputType = {
    id: string
    agentName: string
    enabled: boolean
    config: JsonValue
    updatedAt: Date
    updatedBy: string | null
    _count: AgentConfigCountAggregateOutputType | null
    _min: AgentConfigMinAggregateOutputType | null
    _max: AgentConfigMaxAggregateOutputType | null
  }

  type GetAgentConfigGroupByPayload<T extends AgentConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AgentConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AgentConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AgentConfigGroupByOutputType[P]>
            : GetScalarType<T[P], AgentConfigGroupByOutputType[P]>
        }
      >
    >


  export type AgentConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    agentName?: boolean
    enabled?: boolean
    config?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
  }, ExtArgs["result"]["agentConfig"]>

  export type AgentConfigSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    agentName?: boolean
    enabled?: boolean
    config?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
  }, ExtArgs["result"]["agentConfig"]>

  export type AgentConfigSelectScalar = {
    id?: boolean
    agentName?: boolean
    enabled?: boolean
    config?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
  }


  export type $AgentConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AgentConfig"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      agentName: string
      enabled: boolean
      config: Prisma.JsonValue
      updatedAt: Date
      updatedBy: string | null
    }, ExtArgs["result"]["agentConfig"]>
    composites: {}
  }

  type AgentConfigGetPayload<S extends boolean | null | undefined | AgentConfigDefaultArgs> = $Result.GetResult<Prisma.$AgentConfigPayload, S>

  type AgentConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AgentConfigFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AgentConfigCountAggregateInputType | true
    }

  export interface AgentConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AgentConfig'], meta: { name: 'AgentConfig' } }
    /**
     * Find zero or one AgentConfig that matches the filter.
     * @param {AgentConfigFindUniqueArgs} args - Arguments to find a AgentConfig
     * @example
     * // Get one AgentConfig
     * const agentConfig = await prisma.agentConfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AgentConfigFindUniqueArgs>(args: SelectSubset<T, AgentConfigFindUniqueArgs<ExtArgs>>): Prisma__AgentConfigClient<$Result.GetResult<Prisma.$AgentConfigPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AgentConfig that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AgentConfigFindUniqueOrThrowArgs} args - Arguments to find a AgentConfig
     * @example
     * // Get one AgentConfig
     * const agentConfig = await prisma.agentConfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AgentConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, AgentConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AgentConfigClient<$Result.GetResult<Prisma.$AgentConfigPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AgentConfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentConfigFindFirstArgs} args - Arguments to find a AgentConfig
     * @example
     * // Get one AgentConfig
     * const agentConfig = await prisma.agentConfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AgentConfigFindFirstArgs>(args?: SelectSubset<T, AgentConfigFindFirstArgs<ExtArgs>>): Prisma__AgentConfigClient<$Result.GetResult<Prisma.$AgentConfigPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AgentConfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentConfigFindFirstOrThrowArgs} args - Arguments to find a AgentConfig
     * @example
     * // Get one AgentConfig
     * const agentConfig = await prisma.agentConfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AgentConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, AgentConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__AgentConfigClient<$Result.GetResult<Prisma.$AgentConfigPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AgentConfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AgentConfigs
     * const agentConfigs = await prisma.agentConfig.findMany()
     * 
     * // Get first 10 AgentConfigs
     * const agentConfigs = await prisma.agentConfig.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const agentConfigWithIdOnly = await prisma.agentConfig.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AgentConfigFindManyArgs>(args?: SelectSubset<T, AgentConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentConfigPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AgentConfig.
     * @param {AgentConfigCreateArgs} args - Arguments to create a AgentConfig.
     * @example
     * // Create one AgentConfig
     * const AgentConfig = await prisma.agentConfig.create({
     *   data: {
     *     // ... data to create a AgentConfig
     *   }
     * })
     * 
     */
    create<T extends AgentConfigCreateArgs>(args: SelectSubset<T, AgentConfigCreateArgs<ExtArgs>>): Prisma__AgentConfigClient<$Result.GetResult<Prisma.$AgentConfigPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AgentConfigs.
     * @param {AgentConfigCreateManyArgs} args - Arguments to create many AgentConfigs.
     * @example
     * // Create many AgentConfigs
     * const agentConfig = await prisma.agentConfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AgentConfigCreateManyArgs>(args?: SelectSubset<T, AgentConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AgentConfigs and returns the data saved in the database.
     * @param {AgentConfigCreateManyAndReturnArgs} args - Arguments to create many AgentConfigs.
     * @example
     * // Create many AgentConfigs
     * const agentConfig = await prisma.agentConfig.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AgentConfigs and only return the `id`
     * const agentConfigWithIdOnly = await prisma.agentConfig.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AgentConfigCreateManyAndReturnArgs>(args?: SelectSubset<T, AgentConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentConfigPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AgentConfig.
     * @param {AgentConfigDeleteArgs} args - Arguments to delete one AgentConfig.
     * @example
     * // Delete one AgentConfig
     * const AgentConfig = await prisma.agentConfig.delete({
     *   where: {
     *     // ... filter to delete one AgentConfig
     *   }
     * })
     * 
     */
    delete<T extends AgentConfigDeleteArgs>(args: SelectSubset<T, AgentConfigDeleteArgs<ExtArgs>>): Prisma__AgentConfigClient<$Result.GetResult<Prisma.$AgentConfigPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AgentConfig.
     * @param {AgentConfigUpdateArgs} args - Arguments to update one AgentConfig.
     * @example
     * // Update one AgentConfig
     * const agentConfig = await prisma.agentConfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AgentConfigUpdateArgs>(args: SelectSubset<T, AgentConfigUpdateArgs<ExtArgs>>): Prisma__AgentConfigClient<$Result.GetResult<Prisma.$AgentConfigPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AgentConfigs.
     * @param {AgentConfigDeleteManyArgs} args - Arguments to filter AgentConfigs to delete.
     * @example
     * // Delete a few AgentConfigs
     * const { count } = await prisma.agentConfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AgentConfigDeleteManyArgs>(args?: SelectSubset<T, AgentConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AgentConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AgentConfigs
     * const agentConfig = await prisma.agentConfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AgentConfigUpdateManyArgs>(args: SelectSubset<T, AgentConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AgentConfig.
     * @param {AgentConfigUpsertArgs} args - Arguments to update or create a AgentConfig.
     * @example
     * // Update or create a AgentConfig
     * const agentConfig = await prisma.agentConfig.upsert({
     *   create: {
     *     // ... data to create a AgentConfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AgentConfig we want to update
     *   }
     * })
     */
    upsert<T extends AgentConfigUpsertArgs>(args: SelectSubset<T, AgentConfigUpsertArgs<ExtArgs>>): Prisma__AgentConfigClient<$Result.GetResult<Prisma.$AgentConfigPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AgentConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentConfigCountArgs} args - Arguments to filter AgentConfigs to count.
     * @example
     * // Count the number of AgentConfigs
     * const count = await prisma.agentConfig.count({
     *   where: {
     *     // ... the filter for the AgentConfigs we want to count
     *   }
     * })
    **/
    count<T extends AgentConfigCountArgs>(
      args?: Subset<T, AgentConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AgentConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AgentConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AgentConfigAggregateArgs>(args: Subset<T, AgentConfigAggregateArgs>): Prisma.PrismaPromise<GetAgentConfigAggregateType<T>>

    /**
     * Group by AgentConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentConfigGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AgentConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AgentConfigGroupByArgs['orderBy'] }
        : { orderBy?: AgentConfigGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AgentConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAgentConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AgentConfig model
   */
  readonly fields: AgentConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AgentConfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AgentConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AgentConfig model
   */ 
  interface AgentConfigFieldRefs {
    readonly id: FieldRef<"AgentConfig", 'String'>
    readonly agentName: FieldRef<"AgentConfig", 'String'>
    readonly enabled: FieldRef<"AgentConfig", 'Boolean'>
    readonly config: FieldRef<"AgentConfig", 'Json'>
    readonly updatedAt: FieldRef<"AgentConfig", 'DateTime'>
    readonly updatedBy: FieldRef<"AgentConfig", 'String'>
  }
    

  // Custom InputTypes
  /**
   * AgentConfig findUnique
   */
  export type AgentConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentConfig
     */
    select?: AgentConfigSelect<ExtArgs> | null
    /**
     * Filter, which AgentConfig to fetch.
     */
    where: AgentConfigWhereUniqueInput
  }

  /**
   * AgentConfig findUniqueOrThrow
   */
  export type AgentConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentConfig
     */
    select?: AgentConfigSelect<ExtArgs> | null
    /**
     * Filter, which AgentConfig to fetch.
     */
    where: AgentConfigWhereUniqueInput
  }

  /**
   * AgentConfig findFirst
   */
  export type AgentConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentConfig
     */
    select?: AgentConfigSelect<ExtArgs> | null
    /**
     * Filter, which AgentConfig to fetch.
     */
    where?: AgentConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentConfigs to fetch.
     */
    orderBy?: AgentConfigOrderByWithRelationInput | AgentConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentConfigs.
     */
    cursor?: AgentConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentConfigs.
     */
    distinct?: AgentConfigScalarFieldEnum | AgentConfigScalarFieldEnum[]
  }

  /**
   * AgentConfig findFirstOrThrow
   */
  export type AgentConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentConfig
     */
    select?: AgentConfigSelect<ExtArgs> | null
    /**
     * Filter, which AgentConfig to fetch.
     */
    where?: AgentConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentConfigs to fetch.
     */
    orderBy?: AgentConfigOrderByWithRelationInput | AgentConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentConfigs.
     */
    cursor?: AgentConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentConfigs.
     */
    distinct?: AgentConfigScalarFieldEnum | AgentConfigScalarFieldEnum[]
  }

  /**
   * AgentConfig findMany
   */
  export type AgentConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentConfig
     */
    select?: AgentConfigSelect<ExtArgs> | null
    /**
     * Filter, which AgentConfigs to fetch.
     */
    where?: AgentConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentConfigs to fetch.
     */
    orderBy?: AgentConfigOrderByWithRelationInput | AgentConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AgentConfigs.
     */
    cursor?: AgentConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentConfigs.
     */
    skip?: number
    distinct?: AgentConfigScalarFieldEnum | AgentConfigScalarFieldEnum[]
  }

  /**
   * AgentConfig create
   */
  export type AgentConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentConfig
     */
    select?: AgentConfigSelect<ExtArgs> | null
    /**
     * The data needed to create a AgentConfig.
     */
    data: XOR<AgentConfigCreateInput, AgentConfigUncheckedCreateInput>
  }

  /**
   * AgentConfig createMany
   */
  export type AgentConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AgentConfigs.
     */
    data: AgentConfigCreateManyInput | AgentConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AgentConfig createManyAndReturn
   */
  export type AgentConfigCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentConfig
     */
    select?: AgentConfigSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AgentConfigs.
     */
    data: AgentConfigCreateManyInput | AgentConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AgentConfig update
   */
  export type AgentConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentConfig
     */
    select?: AgentConfigSelect<ExtArgs> | null
    /**
     * The data needed to update a AgentConfig.
     */
    data: XOR<AgentConfigUpdateInput, AgentConfigUncheckedUpdateInput>
    /**
     * Choose, which AgentConfig to update.
     */
    where: AgentConfigWhereUniqueInput
  }

  /**
   * AgentConfig updateMany
   */
  export type AgentConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AgentConfigs.
     */
    data: XOR<AgentConfigUpdateManyMutationInput, AgentConfigUncheckedUpdateManyInput>
    /**
     * Filter which AgentConfigs to update
     */
    where?: AgentConfigWhereInput
  }

  /**
   * AgentConfig upsert
   */
  export type AgentConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentConfig
     */
    select?: AgentConfigSelect<ExtArgs> | null
    /**
     * The filter to search for the AgentConfig to update in case it exists.
     */
    where: AgentConfigWhereUniqueInput
    /**
     * In case the AgentConfig found by the `where` argument doesn't exist, create a new AgentConfig with this data.
     */
    create: XOR<AgentConfigCreateInput, AgentConfigUncheckedCreateInput>
    /**
     * In case the AgentConfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AgentConfigUpdateInput, AgentConfigUncheckedUpdateInput>
  }

  /**
   * AgentConfig delete
   */
  export type AgentConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentConfig
     */
    select?: AgentConfigSelect<ExtArgs> | null
    /**
     * Filter which AgentConfig to delete.
     */
    where: AgentConfigWhereUniqueInput
  }

  /**
   * AgentConfig deleteMany
   */
  export type AgentConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentConfigs to delete
     */
    where?: AgentConfigWhereInput
  }

  /**
   * AgentConfig without action
   */
  export type AgentConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentConfig
     */
    select?: AgentConfigSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const SignalScalarFieldEnum: {
    id: 'id',
    entityType: 'entityType',
    entityId: 'entityId',
    signalType: 'signalType',
    contextSnapshot: 'contextSnapshot',
    traceId: 'traceId',
    firedAt: 'firedAt'
  };

  export type SignalScalarFieldEnum = (typeof SignalScalarFieldEnum)[keyof typeof SignalScalarFieldEnum]


  export const InsightScalarFieldEnum: {
    id: 'id',
    signalId: 'signalId',
    severity: 'severity',
    title: 'title',
    what: 'what',
    why: 'why',
    evidence: 'evidence',
    confidence: 'confidence',
    agent: 'agent',
    createdAt: 'createdAt',
    dismissedAt: 'dismissedAt',
    snoozedUntil: 'snoozedUntil'
  };

  export type InsightScalarFieldEnum = (typeof InsightScalarFieldEnum)[keyof typeof InsightScalarFieldEnum]


  export const PendingActionScalarFieldEnum: {
    id: 'id',
    signalId: 'signalId',
    agent: 'agent',
    actionType: 'actionType',
    actionPayload: 'actionPayload',
    rationale: 'rationale',
    expectedOutcome: 'expectedOutcome',
    confidence: 'confidence',
    riskLevel: 'riskLevel',
    classification: 'classification',
    status: 'status',
    guardrailRule: 'guardrailRule',
    approvalToken: 'approvalToken',
    approvedBy: 'approvedBy',
    approvedAt: 'approvedAt',
    rejectedReason: 'rejectedReason',
    rejectedAt: 'rejectedAt',
    executedAt: 'executedAt',
    executionResult: 'executionResult',
    executionError: 'executionError',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PendingActionScalarFieldEnum = (typeof PendingActionScalarFieldEnum)[keyof typeof PendingActionScalarFieldEnum]


  export const InsightOutcomeScalarFieldEnum: {
    id: 'id',
    insightId: 'insightId',
    measuredAt: 'measuredAt',
    windowHours: 'windowHours',
    metricDeltas: 'metricDeltas',
    outcomeScore: 'outcomeScore',
    createdAt: 'createdAt'
  };

  export type InsightOutcomeScalarFieldEnum = (typeof InsightOutcomeScalarFieldEnum)[keyof typeof InsightOutcomeScalarFieldEnum]


  export const AuditLogScalarFieldEnum: {
    id: 'id',
    signalId: 'signalId',
    event: 'event',
    actor: 'actor',
    payload: 'payload',
    createdAt: 'createdAt'
  };

  export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum]


  export const AgentConfigScalarFieldEnum: {
    id: 'id',
    agentName: 'agentName',
    enabled: 'enabled',
    config: 'config',
    updatedAt: 'updatedAt',
    updatedBy: 'updatedBy'
  };

  export type AgentConfigScalarFieldEnum = (typeof AgentConfigScalarFieldEnum)[keyof typeof AgentConfigScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'EntityType'
   */
  export type EnumEntityTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EntityType'>
    


  /**
   * Reference to a field of type 'EntityType[]'
   */
  export type ListEnumEntityTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EntityType[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'InsightSeverity'
   */
  export type EnumInsightSeverityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InsightSeverity'>
    


  /**
   * Reference to a field of type 'InsightSeverity[]'
   */
  export type ListEnumInsightSeverityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InsightSeverity[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'RiskLevel'
   */
  export type EnumRiskLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RiskLevel'>
    


  /**
   * Reference to a field of type 'RiskLevel[]'
   */
  export type ListEnumRiskLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RiskLevel[]'>
    


  /**
   * Reference to a field of type 'ActionClass'
   */
  export type EnumActionClassFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActionClass'>
    


  /**
   * Reference to a field of type 'ActionClass[]'
   */
  export type ListEnumActionClassFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActionClass[]'>
    


  /**
   * Reference to a field of type 'ActionStatus'
   */
  export type EnumActionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActionStatus'>
    


  /**
   * Reference to a field of type 'ActionStatus[]'
   */
  export type ListEnumActionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActionStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type SignalWhereInput = {
    AND?: SignalWhereInput | SignalWhereInput[]
    OR?: SignalWhereInput[]
    NOT?: SignalWhereInput | SignalWhereInput[]
    id?: StringFilter<"Signal"> | string
    entityType?: EnumEntityTypeFilter<"Signal"> | $Enums.EntityType
    entityId?: StringFilter<"Signal"> | string
    signalType?: StringFilter<"Signal"> | string
    contextSnapshot?: JsonFilter<"Signal">
    traceId?: StringFilter<"Signal"> | string
    firedAt?: DateTimeFilter<"Signal"> | Date | string
    insights?: InsightListRelationFilter
    pendingActions?: PendingActionListRelationFilter
    auditLogs?: AuditLogListRelationFilter
  }

  export type SignalOrderByWithRelationInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    signalType?: SortOrder
    contextSnapshot?: SortOrder
    traceId?: SortOrder
    firedAt?: SortOrder
    insights?: InsightOrderByRelationAggregateInput
    pendingActions?: PendingActionOrderByRelationAggregateInput
    auditLogs?: AuditLogOrderByRelationAggregateInput
  }

  export type SignalWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SignalWhereInput | SignalWhereInput[]
    OR?: SignalWhereInput[]
    NOT?: SignalWhereInput | SignalWhereInput[]
    entityType?: EnumEntityTypeFilter<"Signal"> | $Enums.EntityType
    entityId?: StringFilter<"Signal"> | string
    signalType?: StringFilter<"Signal"> | string
    contextSnapshot?: JsonFilter<"Signal">
    traceId?: StringFilter<"Signal"> | string
    firedAt?: DateTimeFilter<"Signal"> | Date | string
    insights?: InsightListRelationFilter
    pendingActions?: PendingActionListRelationFilter
    auditLogs?: AuditLogListRelationFilter
  }, "id">

  export type SignalOrderByWithAggregationInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    signalType?: SortOrder
    contextSnapshot?: SortOrder
    traceId?: SortOrder
    firedAt?: SortOrder
    _count?: SignalCountOrderByAggregateInput
    _max?: SignalMaxOrderByAggregateInput
    _min?: SignalMinOrderByAggregateInput
  }

  export type SignalScalarWhereWithAggregatesInput = {
    AND?: SignalScalarWhereWithAggregatesInput | SignalScalarWhereWithAggregatesInput[]
    OR?: SignalScalarWhereWithAggregatesInput[]
    NOT?: SignalScalarWhereWithAggregatesInput | SignalScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Signal"> | string
    entityType?: EnumEntityTypeWithAggregatesFilter<"Signal"> | $Enums.EntityType
    entityId?: StringWithAggregatesFilter<"Signal"> | string
    signalType?: StringWithAggregatesFilter<"Signal"> | string
    contextSnapshot?: JsonWithAggregatesFilter<"Signal">
    traceId?: StringWithAggregatesFilter<"Signal"> | string
    firedAt?: DateTimeWithAggregatesFilter<"Signal"> | Date | string
  }

  export type InsightWhereInput = {
    AND?: InsightWhereInput | InsightWhereInput[]
    OR?: InsightWhereInput[]
    NOT?: InsightWhereInput | InsightWhereInput[]
    id?: StringFilter<"Insight"> | string
    signalId?: StringFilter<"Insight"> | string
    severity?: EnumInsightSeverityFilter<"Insight"> | $Enums.InsightSeverity
    title?: StringFilter<"Insight"> | string
    what?: StringFilter<"Insight"> | string
    why?: StringFilter<"Insight"> | string
    evidence?: JsonFilter<"Insight">
    confidence?: FloatFilter<"Insight"> | number
    agent?: StringFilter<"Insight"> | string
    createdAt?: DateTimeFilter<"Insight"> | Date | string
    dismissedAt?: DateTimeNullableFilter<"Insight"> | Date | string | null
    snoozedUntil?: DateTimeNullableFilter<"Insight"> | Date | string | null
    signal?: XOR<SignalRelationFilter, SignalWhereInput>
    outcomes?: InsightOutcomeListRelationFilter
  }

  export type InsightOrderByWithRelationInput = {
    id?: SortOrder
    signalId?: SortOrder
    severity?: SortOrder
    title?: SortOrder
    what?: SortOrder
    why?: SortOrder
    evidence?: SortOrder
    confidence?: SortOrder
    agent?: SortOrder
    createdAt?: SortOrder
    dismissedAt?: SortOrderInput | SortOrder
    snoozedUntil?: SortOrderInput | SortOrder
    signal?: SignalOrderByWithRelationInput
    outcomes?: InsightOutcomeOrderByRelationAggregateInput
  }

  export type InsightWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: InsightWhereInput | InsightWhereInput[]
    OR?: InsightWhereInput[]
    NOT?: InsightWhereInput | InsightWhereInput[]
    signalId?: StringFilter<"Insight"> | string
    severity?: EnumInsightSeverityFilter<"Insight"> | $Enums.InsightSeverity
    title?: StringFilter<"Insight"> | string
    what?: StringFilter<"Insight"> | string
    why?: StringFilter<"Insight"> | string
    evidence?: JsonFilter<"Insight">
    confidence?: FloatFilter<"Insight"> | number
    agent?: StringFilter<"Insight"> | string
    createdAt?: DateTimeFilter<"Insight"> | Date | string
    dismissedAt?: DateTimeNullableFilter<"Insight"> | Date | string | null
    snoozedUntil?: DateTimeNullableFilter<"Insight"> | Date | string | null
    signal?: XOR<SignalRelationFilter, SignalWhereInput>
    outcomes?: InsightOutcomeListRelationFilter
  }, "id">

  export type InsightOrderByWithAggregationInput = {
    id?: SortOrder
    signalId?: SortOrder
    severity?: SortOrder
    title?: SortOrder
    what?: SortOrder
    why?: SortOrder
    evidence?: SortOrder
    confidence?: SortOrder
    agent?: SortOrder
    createdAt?: SortOrder
    dismissedAt?: SortOrderInput | SortOrder
    snoozedUntil?: SortOrderInput | SortOrder
    _count?: InsightCountOrderByAggregateInput
    _avg?: InsightAvgOrderByAggregateInput
    _max?: InsightMaxOrderByAggregateInput
    _min?: InsightMinOrderByAggregateInput
    _sum?: InsightSumOrderByAggregateInput
  }

  export type InsightScalarWhereWithAggregatesInput = {
    AND?: InsightScalarWhereWithAggregatesInput | InsightScalarWhereWithAggregatesInput[]
    OR?: InsightScalarWhereWithAggregatesInput[]
    NOT?: InsightScalarWhereWithAggregatesInput | InsightScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Insight"> | string
    signalId?: StringWithAggregatesFilter<"Insight"> | string
    severity?: EnumInsightSeverityWithAggregatesFilter<"Insight"> | $Enums.InsightSeverity
    title?: StringWithAggregatesFilter<"Insight"> | string
    what?: StringWithAggregatesFilter<"Insight"> | string
    why?: StringWithAggregatesFilter<"Insight"> | string
    evidence?: JsonWithAggregatesFilter<"Insight">
    confidence?: FloatWithAggregatesFilter<"Insight"> | number
    agent?: StringWithAggregatesFilter<"Insight"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Insight"> | Date | string
    dismissedAt?: DateTimeNullableWithAggregatesFilter<"Insight"> | Date | string | null
    snoozedUntil?: DateTimeNullableWithAggregatesFilter<"Insight"> | Date | string | null
  }

  export type PendingActionWhereInput = {
    AND?: PendingActionWhereInput | PendingActionWhereInput[]
    OR?: PendingActionWhereInput[]
    NOT?: PendingActionWhereInput | PendingActionWhereInput[]
    id?: StringFilter<"PendingAction"> | string
    signalId?: StringFilter<"PendingAction"> | string
    agent?: StringFilter<"PendingAction"> | string
    actionType?: StringFilter<"PendingAction"> | string
    actionPayload?: JsonFilter<"PendingAction">
    rationale?: StringFilter<"PendingAction"> | string
    expectedOutcome?: StringFilter<"PendingAction"> | string
    confidence?: FloatFilter<"PendingAction"> | number
    riskLevel?: EnumRiskLevelFilter<"PendingAction"> | $Enums.RiskLevel
    classification?: EnumActionClassFilter<"PendingAction"> | $Enums.ActionClass
    status?: EnumActionStatusFilter<"PendingAction"> | $Enums.ActionStatus
    guardrailRule?: StringNullableFilter<"PendingAction"> | string | null
    approvalToken?: StringNullableFilter<"PendingAction"> | string | null
    approvedBy?: StringNullableFilter<"PendingAction"> | string | null
    approvedAt?: DateTimeNullableFilter<"PendingAction"> | Date | string | null
    rejectedReason?: StringNullableFilter<"PendingAction"> | string | null
    rejectedAt?: DateTimeNullableFilter<"PendingAction"> | Date | string | null
    executedAt?: DateTimeNullableFilter<"PendingAction"> | Date | string | null
    executionResult?: JsonNullableFilter<"PendingAction">
    executionError?: StringNullableFilter<"PendingAction"> | string | null
    expiresAt?: DateTimeFilter<"PendingAction"> | Date | string
    createdAt?: DateTimeFilter<"PendingAction"> | Date | string
    updatedAt?: DateTimeFilter<"PendingAction"> | Date | string
    signal?: XOR<SignalRelationFilter, SignalWhereInput>
  }

  export type PendingActionOrderByWithRelationInput = {
    id?: SortOrder
    signalId?: SortOrder
    agent?: SortOrder
    actionType?: SortOrder
    actionPayload?: SortOrder
    rationale?: SortOrder
    expectedOutcome?: SortOrder
    confidence?: SortOrder
    riskLevel?: SortOrder
    classification?: SortOrder
    status?: SortOrder
    guardrailRule?: SortOrderInput | SortOrder
    approvalToken?: SortOrderInput | SortOrder
    approvedBy?: SortOrderInput | SortOrder
    approvedAt?: SortOrderInput | SortOrder
    rejectedReason?: SortOrderInput | SortOrder
    rejectedAt?: SortOrderInput | SortOrder
    executedAt?: SortOrderInput | SortOrder
    executionResult?: SortOrderInput | SortOrder
    executionError?: SortOrderInput | SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    signal?: SignalOrderByWithRelationInput
  }

  export type PendingActionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    approvalToken?: string
    AND?: PendingActionWhereInput | PendingActionWhereInput[]
    OR?: PendingActionWhereInput[]
    NOT?: PendingActionWhereInput | PendingActionWhereInput[]
    signalId?: StringFilter<"PendingAction"> | string
    agent?: StringFilter<"PendingAction"> | string
    actionType?: StringFilter<"PendingAction"> | string
    actionPayload?: JsonFilter<"PendingAction">
    rationale?: StringFilter<"PendingAction"> | string
    expectedOutcome?: StringFilter<"PendingAction"> | string
    confidence?: FloatFilter<"PendingAction"> | number
    riskLevel?: EnumRiskLevelFilter<"PendingAction"> | $Enums.RiskLevel
    classification?: EnumActionClassFilter<"PendingAction"> | $Enums.ActionClass
    status?: EnumActionStatusFilter<"PendingAction"> | $Enums.ActionStatus
    guardrailRule?: StringNullableFilter<"PendingAction"> | string | null
    approvedBy?: StringNullableFilter<"PendingAction"> | string | null
    approvedAt?: DateTimeNullableFilter<"PendingAction"> | Date | string | null
    rejectedReason?: StringNullableFilter<"PendingAction"> | string | null
    rejectedAt?: DateTimeNullableFilter<"PendingAction"> | Date | string | null
    executedAt?: DateTimeNullableFilter<"PendingAction"> | Date | string | null
    executionResult?: JsonNullableFilter<"PendingAction">
    executionError?: StringNullableFilter<"PendingAction"> | string | null
    expiresAt?: DateTimeFilter<"PendingAction"> | Date | string
    createdAt?: DateTimeFilter<"PendingAction"> | Date | string
    updatedAt?: DateTimeFilter<"PendingAction"> | Date | string
    signal?: XOR<SignalRelationFilter, SignalWhereInput>
  }, "id" | "approvalToken">

  export type PendingActionOrderByWithAggregationInput = {
    id?: SortOrder
    signalId?: SortOrder
    agent?: SortOrder
    actionType?: SortOrder
    actionPayload?: SortOrder
    rationale?: SortOrder
    expectedOutcome?: SortOrder
    confidence?: SortOrder
    riskLevel?: SortOrder
    classification?: SortOrder
    status?: SortOrder
    guardrailRule?: SortOrderInput | SortOrder
    approvalToken?: SortOrderInput | SortOrder
    approvedBy?: SortOrderInput | SortOrder
    approvedAt?: SortOrderInput | SortOrder
    rejectedReason?: SortOrderInput | SortOrder
    rejectedAt?: SortOrderInput | SortOrder
    executedAt?: SortOrderInput | SortOrder
    executionResult?: SortOrderInput | SortOrder
    executionError?: SortOrderInput | SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PendingActionCountOrderByAggregateInput
    _avg?: PendingActionAvgOrderByAggregateInput
    _max?: PendingActionMaxOrderByAggregateInput
    _min?: PendingActionMinOrderByAggregateInput
    _sum?: PendingActionSumOrderByAggregateInput
  }

  export type PendingActionScalarWhereWithAggregatesInput = {
    AND?: PendingActionScalarWhereWithAggregatesInput | PendingActionScalarWhereWithAggregatesInput[]
    OR?: PendingActionScalarWhereWithAggregatesInput[]
    NOT?: PendingActionScalarWhereWithAggregatesInput | PendingActionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PendingAction"> | string
    signalId?: StringWithAggregatesFilter<"PendingAction"> | string
    agent?: StringWithAggregatesFilter<"PendingAction"> | string
    actionType?: StringWithAggregatesFilter<"PendingAction"> | string
    actionPayload?: JsonWithAggregatesFilter<"PendingAction">
    rationale?: StringWithAggregatesFilter<"PendingAction"> | string
    expectedOutcome?: StringWithAggregatesFilter<"PendingAction"> | string
    confidence?: FloatWithAggregatesFilter<"PendingAction"> | number
    riskLevel?: EnumRiskLevelWithAggregatesFilter<"PendingAction"> | $Enums.RiskLevel
    classification?: EnumActionClassWithAggregatesFilter<"PendingAction"> | $Enums.ActionClass
    status?: EnumActionStatusWithAggregatesFilter<"PendingAction"> | $Enums.ActionStatus
    guardrailRule?: StringNullableWithAggregatesFilter<"PendingAction"> | string | null
    approvalToken?: StringNullableWithAggregatesFilter<"PendingAction"> | string | null
    approvedBy?: StringNullableWithAggregatesFilter<"PendingAction"> | string | null
    approvedAt?: DateTimeNullableWithAggregatesFilter<"PendingAction"> | Date | string | null
    rejectedReason?: StringNullableWithAggregatesFilter<"PendingAction"> | string | null
    rejectedAt?: DateTimeNullableWithAggregatesFilter<"PendingAction"> | Date | string | null
    executedAt?: DateTimeNullableWithAggregatesFilter<"PendingAction"> | Date | string | null
    executionResult?: JsonNullableWithAggregatesFilter<"PendingAction">
    executionError?: StringNullableWithAggregatesFilter<"PendingAction"> | string | null
    expiresAt?: DateTimeWithAggregatesFilter<"PendingAction"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"PendingAction"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PendingAction"> | Date | string
  }

  export type InsightOutcomeWhereInput = {
    AND?: InsightOutcomeWhereInput | InsightOutcomeWhereInput[]
    OR?: InsightOutcomeWhereInput[]
    NOT?: InsightOutcomeWhereInput | InsightOutcomeWhereInput[]
    id?: StringFilter<"InsightOutcome"> | string
    insightId?: StringFilter<"InsightOutcome"> | string
    measuredAt?: DateTimeFilter<"InsightOutcome"> | Date | string
    windowHours?: IntFilter<"InsightOutcome"> | number
    metricDeltas?: JsonFilter<"InsightOutcome">
    outcomeScore?: FloatFilter<"InsightOutcome"> | number
    createdAt?: DateTimeFilter<"InsightOutcome"> | Date | string
    insight?: XOR<InsightRelationFilter, InsightWhereInput>
  }

  export type InsightOutcomeOrderByWithRelationInput = {
    id?: SortOrder
    insightId?: SortOrder
    measuredAt?: SortOrder
    windowHours?: SortOrder
    metricDeltas?: SortOrder
    outcomeScore?: SortOrder
    createdAt?: SortOrder
    insight?: InsightOrderByWithRelationInput
  }

  export type InsightOutcomeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: InsightOutcomeWhereInput | InsightOutcomeWhereInput[]
    OR?: InsightOutcomeWhereInput[]
    NOT?: InsightOutcomeWhereInput | InsightOutcomeWhereInput[]
    insightId?: StringFilter<"InsightOutcome"> | string
    measuredAt?: DateTimeFilter<"InsightOutcome"> | Date | string
    windowHours?: IntFilter<"InsightOutcome"> | number
    metricDeltas?: JsonFilter<"InsightOutcome">
    outcomeScore?: FloatFilter<"InsightOutcome"> | number
    createdAt?: DateTimeFilter<"InsightOutcome"> | Date | string
    insight?: XOR<InsightRelationFilter, InsightWhereInput>
  }, "id">

  export type InsightOutcomeOrderByWithAggregationInput = {
    id?: SortOrder
    insightId?: SortOrder
    measuredAt?: SortOrder
    windowHours?: SortOrder
    metricDeltas?: SortOrder
    outcomeScore?: SortOrder
    createdAt?: SortOrder
    _count?: InsightOutcomeCountOrderByAggregateInput
    _avg?: InsightOutcomeAvgOrderByAggregateInput
    _max?: InsightOutcomeMaxOrderByAggregateInput
    _min?: InsightOutcomeMinOrderByAggregateInput
    _sum?: InsightOutcomeSumOrderByAggregateInput
  }

  export type InsightOutcomeScalarWhereWithAggregatesInput = {
    AND?: InsightOutcomeScalarWhereWithAggregatesInput | InsightOutcomeScalarWhereWithAggregatesInput[]
    OR?: InsightOutcomeScalarWhereWithAggregatesInput[]
    NOT?: InsightOutcomeScalarWhereWithAggregatesInput | InsightOutcomeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"InsightOutcome"> | string
    insightId?: StringWithAggregatesFilter<"InsightOutcome"> | string
    measuredAt?: DateTimeWithAggregatesFilter<"InsightOutcome"> | Date | string
    windowHours?: IntWithAggregatesFilter<"InsightOutcome"> | number
    metricDeltas?: JsonWithAggregatesFilter<"InsightOutcome">
    outcomeScore?: FloatWithAggregatesFilter<"InsightOutcome"> | number
    createdAt?: DateTimeWithAggregatesFilter<"InsightOutcome"> | Date | string
  }

  export type AuditLogWhereInput = {
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    id?: StringFilter<"AuditLog"> | string
    signalId?: StringNullableFilter<"AuditLog"> | string | null
    event?: StringFilter<"AuditLog"> | string
    actor?: StringFilter<"AuditLog"> | string
    payload?: JsonFilter<"AuditLog">
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
    signal?: XOR<SignalNullableRelationFilter, SignalWhereInput> | null
  }

  export type AuditLogOrderByWithRelationInput = {
    id?: SortOrder
    signalId?: SortOrderInput | SortOrder
    event?: SortOrder
    actor?: SortOrder
    payload?: SortOrder
    createdAt?: SortOrder
    signal?: SignalOrderByWithRelationInput
  }

  export type AuditLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    signalId?: StringNullableFilter<"AuditLog"> | string | null
    event?: StringFilter<"AuditLog"> | string
    actor?: StringFilter<"AuditLog"> | string
    payload?: JsonFilter<"AuditLog">
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
    signal?: XOR<SignalNullableRelationFilter, SignalWhereInput> | null
  }, "id">

  export type AuditLogOrderByWithAggregationInput = {
    id?: SortOrder
    signalId?: SortOrderInput | SortOrder
    event?: SortOrder
    actor?: SortOrder
    payload?: SortOrder
    createdAt?: SortOrder
    _count?: AuditLogCountOrderByAggregateInput
    _max?: AuditLogMaxOrderByAggregateInput
    _min?: AuditLogMinOrderByAggregateInput
  }

  export type AuditLogScalarWhereWithAggregatesInput = {
    AND?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    OR?: AuditLogScalarWhereWithAggregatesInput[]
    NOT?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuditLog"> | string
    signalId?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    event?: StringWithAggregatesFilter<"AuditLog"> | string
    actor?: StringWithAggregatesFilter<"AuditLog"> | string
    payload?: JsonWithAggregatesFilter<"AuditLog">
    createdAt?: DateTimeWithAggregatesFilter<"AuditLog"> | Date | string
  }

  export type AgentConfigWhereInput = {
    AND?: AgentConfigWhereInput | AgentConfigWhereInput[]
    OR?: AgentConfigWhereInput[]
    NOT?: AgentConfigWhereInput | AgentConfigWhereInput[]
    id?: StringFilter<"AgentConfig"> | string
    agentName?: StringFilter<"AgentConfig"> | string
    enabled?: BoolFilter<"AgentConfig"> | boolean
    config?: JsonFilter<"AgentConfig">
    updatedAt?: DateTimeFilter<"AgentConfig"> | Date | string
    updatedBy?: StringNullableFilter<"AgentConfig"> | string | null
  }

  export type AgentConfigOrderByWithRelationInput = {
    id?: SortOrder
    agentName?: SortOrder
    enabled?: SortOrder
    config?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
  }

  export type AgentConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    agentName?: string
    AND?: AgentConfigWhereInput | AgentConfigWhereInput[]
    OR?: AgentConfigWhereInput[]
    NOT?: AgentConfigWhereInput | AgentConfigWhereInput[]
    enabled?: BoolFilter<"AgentConfig"> | boolean
    config?: JsonFilter<"AgentConfig">
    updatedAt?: DateTimeFilter<"AgentConfig"> | Date | string
    updatedBy?: StringNullableFilter<"AgentConfig"> | string | null
  }, "id" | "agentName">

  export type AgentConfigOrderByWithAggregationInput = {
    id?: SortOrder
    agentName?: SortOrder
    enabled?: SortOrder
    config?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    _count?: AgentConfigCountOrderByAggregateInput
    _max?: AgentConfigMaxOrderByAggregateInput
    _min?: AgentConfigMinOrderByAggregateInput
  }

  export type AgentConfigScalarWhereWithAggregatesInput = {
    AND?: AgentConfigScalarWhereWithAggregatesInput | AgentConfigScalarWhereWithAggregatesInput[]
    OR?: AgentConfigScalarWhereWithAggregatesInput[]
    NOT?: AgentConfigScalarWhereWithAggregatesInput | AgentConfigScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AgentConfig"> | string
    agentName?: StringWithAggregatesFilter<"AgentConfig"> | string
    enabled?: BoolWithAggregatesFilter<"AgentConfig"> | boolean
    config?: JsonWithAggregatesFilter<"AgentConfig">
    updatedAt?: DateTimeWithAggregatesFilter<"AgentConfig"> | Date | string
    updatedBy?: StringNullableWithAggregatesFilter<"AgentConfig"> | string | null
  }

  export type SignalCreateInput = {
    id?: string
    entityType: $Enums.EntityType
    entityId: string
    signalType: string
    contextSnapshot: JsonNullValueInput | InputJsonValue
    traceId: string
    firedAt?: Date | string
    insights?: InsightCreateNestedManyWithoutSignalInput
    pendingActions?: PendingActionCreateNestedManyWithoutSignalInput
    auditLogs?: AuditLogCreateNestedManyWithoutSignalInput
  }

  export type SignalUncheckedCreateInput = {
    id?: string
    entityType: $Enums.EntityType
    entityId: string
    signalType: string
    contextSnapshot: JsonNullValueInput | InputJsonValue
    traceId: string
    firedAt?: Date | string
    insights?: InsightUncheckedCreateNestedManyWithoutSignalInput
    pendingActions?: PendingActionUncheckedCreateNestedManyWithoutSignalInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutSignalInput
  }

  export type SignalUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumEntityTypeFieldUpdateOperationsInput | $Enums.EntityType
    entityId?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    contextSnapshot?: JsonNullValueInput | InputJsonValue
    traceId?: StringFieldUpdateOperationsInput | string
    firedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    insights?: InsightUpdateManyWithoutSignalNestedInput
    pendingActions?: PendingActionUpdateManyWithoutSignalNestedInput
    auditLogs?: AuditLogUpdateManyWithoutSignalNestedInput
  }

  export type SignalUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumEntityTypeFieldUpdateOperationsInput | $Enums.EntityType
    entityId?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    contextSnapshot?: JsonNullValueInput | InputJsonValue
    traceId?: StringFieldUpdateOperationsInput | string
    firedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    insights?: InsightUncheckedUpdateManyWithoutSignalNestedInput
    pendingActions?: PendingActionUncheckedUpdateManyWithoutSignalNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutSignalNestedInput
  }

  export type SignalCreateManyInput = {
    id?: string
    entityType: $Enums.EntityType
    entityId: string
    signalType: string
    contextSnapshot: JsonNullValueInput | InputJsonValue
    traceId: string
    firedAt?: Date | string
  }

  export type SignalUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumEntityTypeFieldUpdateOperationsInput | $Enums.EntityType
    entityId?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    contextSnapshot?: JsonNullValueInput | InputJsonValue
    traceId?: StringFieldUpdateOperationsInput | string
    firedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignalUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumEntityTypeFieldUpdateOperationsInput | $Enums.EntityType
    entityId?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    contextSnapshot?: JsonNullValueInput | InputJsonValue
    traceId?: StringFieldUpdateOperationsInput | string
    firedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InsightCreateInput = {
    id?: string
    severity: $Enums.InsightSeverity
    title: string
    what: string
    why: string
    evidence: JsonNullValueInput | InputJsonValue
    confidence: number
    agent: string
    createdAt?: Date | string
    dismissedAt?: Date | string | null
    snoozedUntil?: Date | string | null
    signal: SignalCreateNestedOneWithoutInsightsInput
    outcomes?: InsightOutcomeCreateNestedManyWithoutInsightInput
  }

  export type InsightUncheckedCreateInput = {
    id?: string
    signalId: string
    severity: $Enums.InsightSeverity
    title: string
    what: string
    why: string
    evidence: JsonNullValueInput | InputJsonValue
    confidence: number
    agent: string
    createdAt?: Date | string
    dismissedAt?: Date | string | null
    snoozedUntil?: Date | string | null
    outcomes?: InsightOutcomeUncheckedCreateNestedManyWithoutInsightInput
  }

  export type InsightUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    severity?: EnumInsightSeverityFieldUpdateOperationsInput | $Enums.InsightSeverity
    title?: StringFieldUpdateOperationsInput | string
    what?: StringFieldUpdateOperationsInput | string
    why?: StringFieldUpdateOperationsInput | string
    evidence?: JsonNullValueInput | InputJsonValue
    confidence?: FloatFieldUpdateOperationsInput | number
    agent?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dismissedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    snoozedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    signal?: SignalUpdateOneRequiredWithoutInsightsNestedInput
    outcomes?: InsightOutcomeUpdateManyWithoutInsightNestedInput
  }

  export type InsightUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    signalId?: StringFieldUpdateOperationsInput | string
    severity?: EnumInsightSeverityFieldUpdateOperationsInput | $Enums.InsightSeverity
    title?: StringFieldUpdateOperationsInput | string
    what?: StringFieldUpdateOperationsInput | string
    why?: StringFieldUpdateOperationsInput | string
    evidence?: JsonNullValueInput | InputJsonValue
    confidence?: FloatFieldUpdateOperationsInput | number
    agent?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dismissedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    snoozedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    outcomes?: InsightOutcomeUncheckedUpdateManyWithoutInsightNestedInput
  }

  export type InsightCreateManyInput = {
    id?: string
    signalId: string
    severity: $Enums.InsightSeverity
    title: string
    what: string
    why: string
    evidence: JsonNullValueInput | InputJsonValue
    confidence: number
    agent: string
    createdAt?: Date | string
    dismissedAt?: Date | string | null
    snoozedUntil?: Date | string | null
  }

  export type InsightUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    severity?: EnumInsightSeverityFieldUpdateOperationsInput | $Enums.InsightSeverity
    title?: StringFieldUpdateOperationsInput | string
    what?: StringFieldUpdateOperationsInput | string
    why?: StringFieldUpdateOperationsInput | string
    evidence?: JsonNullValueInput | InputJsonValue
    confidence?: FloatFieldUpdateOperationsInput | number
    agent?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dismissedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    snoozedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type InsightUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    signalId?: StringFieldUpdateOperationsInput | string
    severity?: EnumInsightSeverityFieldUpdateOperationsInput | $Enums.InsightSeverity
    title?: StringFieldUpdateOperationsInput | string
    what?: StringFieldUpdateOperationsInput | string
    why?: StringFieldUpdateOperationsInput | string
    evidence?: JsonNullValueInput | InputJsonValue
    confidence?: FloatFieldUpdateOperationsInput | number
    agent?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dismissedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    snoozedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PendingActionCreateInput = {
    id?: string
    agent: string
    actionType: string
    actionPayload: JsonNullValueInput | InputJsonValue
    rationale: string
    expectedOutcome: string
    confidence: number
    riskLevel: $Enums.RiskLevel
    classification: $Enums.ActionClass
    status?: $Enums.ActionStatus
    guardrailRule?: string | null
    approvalToken?: string | null
    approvedBy?: string | null
    approvedAt?: Date | string | null
    rejectedReason?: string | null
    rejectedAt?: Date | string | null
    executedAt?: Date | string | null
    executionResult?: NullableJsonNullValueInput | InputJsonValue
    executionError?: string | null
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    signal: SignalCreateNestedOneWithoutPendingActionsInput
  }

  export type PendingActionUncheckedCreateInput = {
    id?: string
    signalId: string
    agent: string
    actionType: string
    actionPayload: JsonNullValueInput | InputJsonValue
    rationale: string
    expectedOutcome: string
    confidence: number
    riskLevel: $Enums.RiskLevel
    classification: $Enums.ActionClass
    status?: $Enums.ActionStatus
    guardrailRule?: string | null
    approvalToken?: string | null
    approvedBy?: string | null
    approvedAt?: Date | string | null
    rejectedReason?: string | null
    rejectedAt?: Date | string | null
    executedAt?: Date | string | null
    executionResult?: NullableJsonNullValueInput | InputJsonValue
    executionError?: string | null
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PendingActionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    agent?: StringFieldUpdateOperationsInput | string
    actionType?: StringFieldUpdateOperationsInput | string
    actionPayload?: JsonNullValueInput | InputJsonValue
    rationale?: StringFieldUpdateOperationsInput | string
    expectedOutcome?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    classification?: EnumActionClassFieldUpdateOperationsInput | $Enums.ActionClass
    status?: EnumActionStatusFieldUpdateOperationsInput | $Enums.ActionStatus
    guardrailRule?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedReason?: NullableStringFieldUpdateOperationsInput | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    executedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    executionResult?: NullableJsonNullValueInput | InputJsonValue
    executionError?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    signal?: SignalUpdateOneRequiredWithoutPendingActionsNestedInput
  }

  export type PendingActionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    signalId?: StringFieldUpdateOperationsInput | string
    agent?: StringFieldUpdateOperationsInput | string
    actionType?: StringFieldUpdateOperationsInput | string
    actionPayload?: JsonNullValueInput | InputJsonValue
    rationale?: StringFieldUpdateOperationsInput | string
    expectedOutcome?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    classification?: EnumActionClassFieldUpdateOperationsInput | $Enums.ActionClass
    status?: EnumActionStatusFieldUpdateOperationsInput | $Enums.ActionStatus
    guardrailRule?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedReason?: NullableStringFieldUpdateOperationsInput | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    executedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    executionResult?: NullableJsonNullValueInput | InputJsonValue
    executionError?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PendingActionCreateManyInput = {
    id?: string
    signalId: string
    agent: string
    actionType: string
    actionPayload: JsonNullValueInput | InputJsonValue
    rationale: string
    expectedOutcome: string
    confidence: number
    riskLevel: $Enums.RiskLevel
    classification: $Enums.ActionClass
    status?: $Enums.ActionStatus
    guardrailRule?: string | null
    approvalToken?: string | null
    approvedBy?: string | null
    approvedAt?: Date | string | null
    rejectedReason?: string | null
    rejectedAt?: Date | string | null
    executedAt?: Date | string | null
    executionResult?: NullableJsonNullValueInput | InputJsonValue
    executionError?: string | null
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PendingActionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    agent?: StringFieldUpdateOperationsInput | string
    actionType?: StringFieldUpdateOperationsInput | string
    actionPayload?: JsonNullValueInput | InputJsonValue
    rationale?: StringFieldUpdateOperationsInput | string
    expectedOutcome?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    classification?: EnumActionClassFieldUpdateOperationsInput | $Enums.ActionClass
    status?: EnumActionStatusFieldUpdateOperationsInput | $Enums.ActionStatus
    guardrailRule?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedReason?: NullableStringFieldUpdateOperationsInput | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    executedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    executionResult?: NullableJsonNullValueInput | InputJsonValue
    executionError?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PendingActionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    signalId?: StringFieldUpdateOperationsInput | string
    agent?: StringFieldUpdateOperationsInput | string
    actionType?: StringFieldUpdateOperationsInput | string
    actionPayload?: JsonNullValueInput | InputJsonValue
    rationale?: StringFieldUpdateOperationsInput | string
    expectedOutcome?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    classification?: EnumActionClassFieldUpdateOperationsInput | $Enums.ActionClass
    status?: EnumActionStatusFieldUpdateOperationsInput | $Enums.ActionStatus
    guardrailRule?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedReason?: NullableStringFieldUpdateOperationsInput | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    executedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    executionResult?: NullableJsonNullValueInput | InputJsonValue
    executionError?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InsightOutcomeCreateInput = {
    id?: string
    measuredAt: Date | string
    windowHours: number
    metricDeltas: JsonNullValueInput | InputJsonValue
    outcomeScore: number
    createdAt?: Date | string
    insight: InsightCreateNestedOneWithoutOutcomesInput
  }

  export type InsightOutcomeUncheckedCreateInput = {
    id?: string
    insightId: string
    measuredAt: Date | string
    windowHours: number
    metricDeltas: JsonNullValueInput | InputJsonValue
    outcomeScore: number
    createdAt?: Date | string
  }

  export type InsightOutcomeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    measuredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    windowHours?: IntFieldUpdateOperationsInput | number
    metricDeltas?: JsonNullValueInput | InputJsonValue
    outcomeScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    insight?: InsightUpdateOneRequiredWithoutOutcomesNestedInput
  }

  export type InsightOutcomeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    insightId?: StringFieldUpdateOperationsInput | string
    measuredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    windowHours?: IntFieldUpdateOperationsInput | number
    metricDeltas?: JsonNullValueInput | InputJsonValue
    outcomeScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InsightOutcomeCreateManyInput = {
    id?: string
    insightId: string
    measuredAt: Date | string
    windowHours: number
    metricDeltas: JsonNullValueInput | InputJsonValue
    outcomeScore: number
    createdAt?: Date | string
  }

  export type InsightOutcomeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    measuredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    windowHours?: IntFieldUpdateOperationsInput | number
    metricDeltas?: JsonNullValueInput | InputJsonValue
    outcomeScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InsightOutcomeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    insightId?: StringFieldUpdateOperationsInput | string
    measuredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    windowHours?: IntFieldUpdateOperationsInput | number
    metricDeltas?: JsonNullValueInput | InputJsonValue
    outcomeScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateInput = {
    id?: string
    event: string
    actor: string
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    signal?: SignalCreateNestedOneWithoutAuditLogsInput
  }

  export type AuditLogUncheckedCreateInput = {
    id?: string
    signalId?: string | null
    event: string
    actor: string
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    event?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    signal?: SignalUpdateOneWithoutAuditLogsNestedInput
  }

  export type AuditLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    signalId?: NullableStringFieldUpdateOperationsInput | string | null
    event?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateManyInput = {
    id?: string
    signalId?: string | null
    event: string
    actor: string
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    event?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    signalId?: NullableStringFieldUpdateOperationsInput | string | null
    event?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentConfigCreateInput = {
    id?: string
    agentName: string
    enabled?: boolean
    config: JsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
    updatedBy?: string | null
  }

  export type AgentConfigUncheckedCreateInput = {
    id?: string
    agentName: string
    enabled?: boolean
    config: JsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
    updatedBy?: string | null
  }

  export type AgentConfigUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentName?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    config?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AgentConfigUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentName?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    config?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AgentConfigCreateManyInput = {
    id?: string
    agentName: string
    enabled?: boolean
    config: JsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
    updatedBy?: string | null
  }

  export type AgentConfigUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentName?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    config?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AgentConfigUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentName?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    config?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumEntityTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.EntityType | EnumEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.EntityType[] | ListEnumEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.EntityType[] | ListEnumEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumEntityTypeFilter<$PrismaModel> | $Enums.EntityType
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type InsightListRelationFilter = {
    every?: InsightWhereInput
    some?: InsightWhereInput
    none?: InsightWhereInput
  }

  export type PendingActionListRelationFilter = {
    every?: PendingActionWhereInput
    some?: PendingActionWhereInput
    none?: PendingActionWhereInput
  }

  export type AuditLogListRelationFilter = {
    every?: AuditLogWhereInput
    some?: AuditLogWhereInput
    none?: AuditLogWhereInput
  }

  export type InsightOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PendingActionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AuditLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SignalCountOrderByAggregateInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    signalType?: SortOrder
    contextSnapshot?: SortOrder
    traceId?: SortOrder
    firedAt?: SortOrder
  }

  export type SignalMaxOrderByAggregateInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    signalType?: SortOrder
    traceId?: SortOrder
    firedAt?: SortOrder
  }

  export type SignalMinOrderByAggregateInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    signalType?: SortOrder
    traceId?: SortOrder
    firedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumEntityTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EntityType | EnumEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.EntityType[] | ListEnumEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.EntityType[] | ListEnumEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumEntityTypeWithAggregatesFilter<$PrismaModel> | $Enums.EntityType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEntityTypeFilter<$PrismaModel>
    _max?: NestedEnumEntityTypeFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumInsightSeverityFilter<$PrismaModel = never> = {
    equals?: $Enums.InsightSeverity | EnumInsightSeverityFieldRefInput<$PrismaModel>
    in?: $Enums.InsightSeverity[] | ListEnumInsightSeverityFieldRefInput<$PrismaModel>
    notIn?: $Enums.InsightSeverity[] | ListEnumInsightSeverityFieldRefInput<$PrismaModel>
    not?: NestedEnumInsightSeverityFilter<$PrismaModel> | $Enums.InsightSeverity
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type SignalRelationFilter = {
    is?: SignalWhereInput
    isNot?: SignalWhereInput
  }

  export type InsightOutcomeListRelationFilter = {
    every?: InsightOutcomeWhereInput
    some?: InsightOutcomeWhereInput
    none?: InsightOutcomeWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type InsightOutcomeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InsightCountOrderByAggregateInput = {
    id?: SortOrder
    signalId?: SortOrder
    severity?: SortOrder
    title?: SortOrder
    what?: SortOrder
    why?: SortOrder
    evidence?: SortOrder
    confidence?: SortOrder
    agent?: SortOrder
    createdAt?: SortOrder
    dismissedAt?: SortOrder
    snoozedUntil?: SortOrder
  }

  export type InsightAvgOrderByAggregateInput = {
    confidence?: SortOrder
  }

  export type InsightMaxOrderByAggregateInput = {
    id?: SortOrder
    signalId?: SortOrder
    severity?: SortOrder
    title?: SortOrder
    what?: SortOrder
    why?: SortOrder
    confidence?: SortOrder
    agent?: SortOrder
    createdAt?: SortOrder
    dismissedAt?: SortOrder
    snoozedUntil?: SortOrder
  }

  export type InsightMinOrderByAggregateInput = {
    id?: SortOrder
    signalId?: SortOrder
    severity?: SortOrder
    title?: SortOrder
    what?: SortOrder
    why?: SortOrder
    confidence?: SortOrder
    agent?: SortOrder
    createdAt?: SortOrder
    dismissedAt?: SortOrder
    snoozedUntil?: SortOrder
  }

  export type InsightSumOrderByAggregateInput = {
    confidence?: SortOrder
  }

  export type EnumInsightSeverityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InsightSeverity | EnumInsightSeverityFieldRefInput<$PrismaModel>
    in?: $Enums.InsightSeverity[] | ListEnumInsightSeverityFieldRefInput<$PrismaModel>
    notIn?: $Enums.InsightSeverity[] | ListEnumInsightSeverityFieldRefInput<$PrismaModel>
    not?: NestedEnumInsightSeverityWithAggregatesFilter<$PrismaModel> | $Enums.InsightSeverity
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInsightSeverityFilter<$PrismaModel>
    _max?: NestedEnumInsightSeverityFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumRiskLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | EnumRiskLevelFieldRefInput<$PrismaModel>
    in?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskLevelFilter<$PrismaModel> | $Enums.RiskLevel
  }

  export type EnumActionClassFilter<$PrismaModel = never> = {
    equals?: $Enums.ActionClass | EnumActionClassFieldRefInput<$PrismaModel>
    in?: $Enums.ActionClass[] | ListEnumActionClassFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActionClass[] | ListEnumActionClassFieldRefInput<$PrismaModel>
    not?: NestedEnumActionClassFilter<$PrismaModel> | $Enums.ActionClass
  }

  export type EnumActionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ActionStatus | EnumActionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ActionStatus[] | ListEnumActionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActionStatus[] | ListEnumActionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumActionStatusFilter<$PrismaModel> | $Enums.ActionStatus
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type PendingActionCountOrderByAggregateInput = {
    id?: SortOrder
    signalId?: SortOrder
    agent?: SortOrder
    actionType?: SortOrder
    actionPayload?: SortOrder
    rationale?: SortOrder
    expectedOutcome?: SortOrder
    confidence?: SortOrder
    riskLevel?: SortOrder
    classification?: SortOrder
    status?: SortOrder
    guardrailRule?: SortOrder
    approvalToken?: SortOrder
    approvedBy?: SortOrder
    approvedAt?: SortOrder
    rejectedReason?: SortOrder
    rejectedAt?: SortOrder
    executedAt?: SortOrder
    executionResult?: SortOrder
    executionError?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PendingActionAvgOrderByAggregateInput = {
    confidence?: SortOrder
  }

  export type PendingActionMaxOrderByAggregateInput = {
    id?: SortOrder
    signalId?: SortOrder
    agent?: SortOrder
    actionType?: SortOrder
    rationale?: SortOrder
    expectedOutcome?: SortOrder
    confidence?: SortOrder
    riskLevel?: SortOrder
    classification?: SortOrder
    status?: SortOrder
    guardrailRule?: SortOrder
    approvalToken?: SortOrder
    approvedBy?: SortOrder
    approvedAt?: SortOrder
    rejectedReason?: SortOrder
    rejectedAt?: SortOrder
    executedAt?: SortOrder
    executionError?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PendingActionMinOrderByAggregateInput = {
    id?: SortOrder
    signalId?: SortOrder
    agent?: SortOrder
    actionType?: SortOrder
    rationale?: SortOrder
    expectedOutcome?: SortOrder
    confidence?: SortOrder
    riskLevel?: SortOrder
    classification?: SortOrder
    status?: SortOrder
    guardrailRule?: SortOrder
    approvalToken?: SortOrder
    approvedBy?: SortOrder
    approvedAt?: SortOrder
    rejectedReason?: SortOrder
    rejectedAt?: SortOrder
    executedAt?: SortOrder
    executionError?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PendingActionSumOrderByAggregateInput = {
    confidence?: SortOrder
  }

  export type EnumRiskLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | EnumRiskLevelFieldRefInput<$PrismaModel>
    in?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskLevelWithAggregatesFilter<$PrismaModel> | $Enums.RiskLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRiskLevelFilter<$PrismaModel>
    _max?: NestedEnumRiskLevelFilter<$PrismaModel>
  }

  export type EnumActionClassWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActionClass | EnumActionClassFieldRefInput<$PrismaModel>
    in?: $Enums.ActionClass[] | ListEnumActionClassFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActionClass[] | ListEnumActionClassFieldRefInput<$PrismaModel>
    not?: NestedEnumActionClassWithAggregatesFilter<$PrismaModel> | $Enums.ActionClass
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumActionClassFilter<$PrismaModel>
    _max?: NestedEnumActionClassFilter<$PrismaModel>
  }

  export type EnumActionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActionStatus | EnumActionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ActionStatus[] | ListEnumActionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActionStatus[] | ListEnumActionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumActionStatusWithAggregatesFilter<$PrismaModel> | $Enums.ActionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumActionStatusFilter<$PrismaModel>
    _max?: NestedEnumActionStatusFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type InsightRelationFilter = {
    is?: InsightWhereInput
    isNot?: InsightWhereInput
  }

  export type InsightOutcomeCountOrderByAggregateInput = {
    id?: SortOrder
    insightId?: SortOrder
    measuredAt?: SortOrder
    windowHours?: SortOrder
    metricDeltas?: SortOrder
    outcomeScore?: SortOrder
    createdAt?: SortOrder
  }

  export type InsightOutcomeAvgOrderByAggregateInput = {
    windowHours?: SortOrder
    outcomeScore?: SortOrder
  }

  export type InsightOutcomeMaxOrderByAggregateInput = {
    id?: SortOrder
    insightId?: SortOrder
    measuredAt?: SortOrder
    windowHours?: SortOrder
    outcomeScore?: SortOrder
    createdAt?: SortOrder
  }

  export type InsightOutcomeMinOrderByAggregateInput = {
    id?: SortOrder
    insightId?: SortOrder
    measuredAt?: SortOrder
    windowHours?: SortOrder
    outcomeScore?: SortOrder
    createdAt?: SortOrder
  }

  export type InsightOutcomeSumOrderByAggregateInput = {
    windowHours?: SortOrder
    outcomeScore?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type SignalNullableRelationFilter = {
    is?: SignalWhereInput | null
    isNot?: SignalWhereInput | null
  }

  export type AuditLogCountOrderByAggregateInput = {
    id?: SortOrder
    signalId?: SortOrder
    event?: SortOrder
    actor?: SortOrder
    payload?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogMaxOrderByAggregateInput = {
    id?: SortOrder
    signalId?: SortOrder
    event?: SortOrder
    actor?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogMinOrderByAggregateInput = {
    id?: SortOrder
    signalId?: SortOrder
    event?: SortOrder
    actor?: SortOrder
    createdAt?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type AgentConfigCountOrderByAggregateInput = {
    id?: SortOrder
    agentName?: SortOrder
    enabled?: SortOrder
    config?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
  }

  export type AgentConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    agentName?: SortOrder
    enabled?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
  }

  export type AgentConfigMinOrderByAggregateInput = {
    id?: SortOrder
    agentName?: SortOrder
    enabled?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type InsightCreateNestedManyWithoutSignalInput = {
    create?: XOR<InsightCreateWithoutSignalInput, InsightUncheckedCreateWithoutSignalInput> | InsightCreateWithoutSignalInput[] | InsightUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: InsightCreateOrConnectWithoutSignalInput | InsightCreateOrConnectWithoutSignalInput[]
    createMany?: InsightCreateManySignalInputEnvelope
    connect?: InsightWhereUniqueInput | InsightWhereUniqueInput[]
  }

  export type PendingActionCreateNestedManyWithoutSignalInput = {
    create?: XOR<PendingActionCreateWithoutSignalInput, PendingActionUncheckedCreateWithoutSignalInput> | PendingActionCreateWithoutSignalInput[] | PendingActionUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: PendingActionCreateOrConnectWithoutSignalInput | PendingActionCreateOrConnectWithoutSignalInput[]
    createMany?: PendingActionCreateManySignalInputEnvelope
    connect?: PendingActionWhereUniqueInput | PendingActionWhereUniqueInput[]
  }

  export type AuditLogCreateNestedManyWithoutSignalInput = {
    create?: XOR<AuditLogCreateWithoutSignalInput, AuditLogUncheckedCreateWithoutSignalInput> | AuditLogCreateWithoutSignalInput[] | AuditLogUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutSignalInput | AuditLogCreateOrConnectWithoutSignalInput[]
    createMany?: AuditLogCreateManySignalInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type InsightUncheckedCreateNestedManyWithoutSignalInput = {
    create?: XOR<InsightCreateWithoutSignalInput, InsightUncheckedCreateWithoutSignalInput> | InsightCreateWithoutSignalInput[] | InsightUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: InsightCreateOrConnectWithoutSignalInput | InsightCreateOrConnectWithoutSignalInput[]
    createMany?: InsightCreateManySignalInputEnvelope
    connect?: InsightWhereUniqueInput | InsightWhereUniqueInput[]
  }

  export type PendingActionUncheckedCreateNestedManyWithoutSignalInput = {
    create?: XOR<PendingActionCreateWithoutSignalInput, PendingActionUncheckedCreateWithoutSignalInput> | PendingActionCreateWithoutSignalInput[] | PendingActionUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: PendingActionCreateOrConnectWithoutSignalInput | PendingActionCreateOrConnectWithoutSignalInput[]
    createMany?: PendingActionCreateManySignalInputEnvelope
    connect?: PendingActionWhereUniqueInput | PendingActionWhereUniqueInput[]
  }

  export type AuditLogUncheckedCreateNestedManyWithoutSignalInput = {
    create?: XOR<AuditLogCreateWithoutSignalInput, AuditLogUncheckedCreateWithoutSignalInput> | AuditLogCreateWithoutSignalInput[] | AuditLogUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutSignalInput | AuditLogCreateOrConnectWithoutSignalInput[]
    createMany?: AuditLogCreateManySignalInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumEntityTypeFieldUpdateOperationsInput = {
    set?: $Enums.EntityType
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type InsightUpdateManyWithoutSignalNestedInput = {
    create?: XOR<InsightCreateWithoutSignalInput, InsightUncheckedCreateWithoutSignalInput> | InsightCreateWithoutSignalInput[] | InsightUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: InsightCreateOrConnectWithoutSignalInput | InsightCreateOrConnectWithoutSignalInput[]
    upsert?: InsightUpsertWithWhereUniqueWithoutSignalInput | InsightUpsertWithWhereUniqueWithoutSignalInput[]
    createMany?: InsightCreateManySignalInputEnvelope
    set?: InsightWhereUniqueInput | InsightWhereUniqueInput[]
    disconnect?: InsightWhereUniqueInput | InsightWhereUniqueInput[]
    delete?: InsightWhereUniqueInput | InsightWhereUniqueInput[]
    connect?: InsightWhereUniqueInput | InsightWhereUniqueInput[]
    update?: InsightUpdateWithWhereUniqueWithoutSignalInput | InsightUpdateWithWhereUniqueWithoutSignalInput[]
    updateMany?: InsightUpdateManyWithWhereWithoutSignalInput | InsightUpdateManyWithWhereWithoutSignalInput[]
    deleteMany?: InsightScalarWhereInput | InsightScalarWhereInput[]
  }

  export type PendingActionUpdateManyWithoutSignalNestedInput = {
    create?: XOR<PendingActionCreateWithoutSignalInput, PendingActionUncheckedCreateWithoutSignalInput> | PendingActionCreateWithoutSignalInput[] | PendingActionUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: PendingActionCreateOrConnectWithoutSignalInput | PendingActionCreateOrConnectWithoutSignalInput[]
    upsert?: PendingActionUpsertWithWhereUniqueWithoutSignalInput | PendingActionUpsertWithWhereUniqueWithoutSignalInput[]
    createMany?: PendingActionCreateManySignalInputEnvelope
    set?: PendingActionWhereUniqueInput | PendingActionWhereUniqueInput[]
    disconnect?: PendingActionWhereUniqueInput | PendingActionWhereUniqueInput[]
    delete?: PendingActionWhereUniqueInput | PendingActionWhereUniqueInput[]
    connect?: PendingActionWhereUniqueInput | PendingActionWhereUniqueInput[]
    update?: PendingActionUpdateWithWhereUniqueWithoutSignalInput | PendingActionUpdateWithWhereUniqueWithoutSignalInput[]
    updateMany?: PendingActionUpdateManyWithWhereWithoutSignalInput | PendingActionUpdateManyWithWhereWithoutSignalInput[]
    deleteMany?: PendingActionScalarWhereInput | PendingActionScalarWhereInput[]
  }

  export type AuditLogUpdateManyWithoutSignalNestedInput = {
    create?: XOR<AuditLogCreateWithoutSignalInput, AuditLogUncheckedCreateWithoutSignalInput> | AuditLogCreateWithoutSignalInput[] | AuditLogUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutSignalInput | AuditLogCreateOrConnectWithoutSignalInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutSignalInput | AuditLogUpsertWithWhereUniqueWithoutSignalInput[]
    createMany?: AuditLogCreateManySignalInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutSignalInput | AuditLogUpdateWithWhereUniqueWithoutSignalInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutSignalInput | AuditLogUpdateManyWithWhereWithoutSignalInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type InsightUncheckedUpdateManyWithoutSignalNestedInput = {
    create?: XOR<InsightCreateWithoutSignalInput, InsightUncheckedCreateWithoutSignalInput> | InsightCreateWithoutSignalInput[] | InsightUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: InsightCreateOrConnectWithoutSignalInput | InsightCreateOrConnectWithoutSignalInput[]
    upsert?: InsightUpsertWithWhereUniqueWithoutSignalInput | InsightUpsertWithWhereUniqueWithoutSignalInput[]
    createMany?: InsightCreateManySignalInputEnvelope
    set?: InsightWhereUniqueInput | InsightWhereUniqueInput[]
    disconnect?: InsightWhereUniqueInput | InsightWhereUniqueInput[]
    delete?: InsightWhereUniqueInput | InsightWhereUniqueInput[]
    connect?: InsightWhereUniqueInput | InsightWhereUniqueInput[]
    update?: InsightUpdateWithWhereUniqueWithoutSignalInput | InsightUpdateWithWhereUniqueWithoutSignalInput[]
    updateMany?: InsightUpdateManyWithWhereWithoutSignalInput | InsightUpdateManyWithWhereWithoutSignalInput[]
    deleteMany?: InsightScalarWhereInput | InsightScalarWhereInput[]
  }

  export type PendingActionUncheckedUpdateManyWithoutSignalNestedInput = {
    create?: XOR<PendingActionCreateWithoutSignalInput, PendingActionUncheckedCreateWithoutSignalInput> | PendingActionCreateWithoutSignalInput[] | PendingActionUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: PendingActionCreateOrConnectWithoutSignalInput | PendingActionCreateOrConnectWithoutSignalInput[]
    upsert?: PendingActionUpsertWithWhereUniqueWithoutSignalInput | PendingActionUpsertWithWhereUniqueWithoutSignalInput[]
    createMany?: PendingActionCreateManySignalInputEnvelope
    set?: PendingActionWhereUniqueInput | PendingActionWhereUniqueInput[]
    disconnect?: PendingActionWhereUniqueInput | PendingActionWhereUniqueInput[]
    delete?: PendingActionWhereUniqueInput | PendingActionWhereUniqueInput[]
    connect?: PendingActionWhereUniqueInput | PendingActionWhereUniqueInput[]
    update?: PendingActionUpdateWithWhereUniqueWithoutSignalInput | PendingActionUpdateWithWhereUniqueWithoutSignalInput[]
    updateMany?: PendingActionUpdateManyWithWhereWithoutSignalInput | PendingActionUpdateManyWithWhereWithoutSignalInput[]
    deleteMany?: PendingActionScalarWhereInput | PendingActionScalarWhereInput[]
  }

  export type AuditLogUncheckedUpdateManyWithoutSignalNestedInput = {
    create?: XOR<AuditLogCreateWithoutSignalInput, AuditLogUncheckedCreateWithoutSignalInput> | AuditLogCreateWithoutSignalInput[] | AuditLogUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutSignalInput | AuditLogCreateOrConnectWithoutSignalInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutSignalInput | AuditLogUpsertWithWhereUniqueWithoutSignalInput[]
    createMany?: AuditLogCreateManySignalInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutSignalInput | AuditLogUpdateWithWhereUniqueWithoutSignalInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutSignalInput | AuditLogUpdateManyWithWhereWithoutSignalInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type SignalCreateNestedOneWithoutInsightsInput = {
    create?: XOR<SignalCreateWithoutInsightsInput, SignalUncheckedCreateWithoutInsightsInput>
    connectOrCreate?: SignalCreateOrConnectWithoutInsightsInput
    connect?: SignalWhereUniqueInput
  }

  export type InsightOutcomeCreateNestedManyWithoutInsightInput = {
    create?: XOR<InsightOutcomeCreateWithoutInsightInput, InsightOutcomeUncheckedCreateWithoutInsightInput> | InsightOutcomeCreateWithoutInsightInput[] | InsightOutcomeUncheckedCreateWithoutInsightInput[]
    connectOrCreate?: InsightOutcomeCreateOrConnectWithoutInsightInput | InsightOutcomeCreateOrConnectWithoutInsightInput[]
    createMany?: InsightOutcomeCreateManyInsightInputEnvelope
    connect?: InsightOutcomeWhereUniqueInput | InsightOutcomeWhereUniqueInput[]
  }

  export type InsightOutcomeUncheckedCreateNestedManyWithoutInsightInput = {
    create?: XOR<InsightOutcomeCreateWithoutInsightInput, InsightOutcomeUncheckedCreateWithoutInsightInput> | InsightOutcomeCreateWithoutInsightInput[] | InsightOutcomeUncheckedCreateWithoutInsightInput[]
    connectOrCreate?: InsightOutcomeCreateOrConnectWithoutInsightInput | InsightOutcomeCreateOrConnectWithoutInsightInput[]
    createMany?: InsightOutcomeCreateManyInsightInputEnvelope
    connect?: InsightOutcomeWhereUniqueInput | InsightOutcomeWhereUniqueInput[]
  }

  export type EnumInsightSeverityFieldUpdateOperationsInput = {
    set?: $Enums.InsightSeverity
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type SignalUpdateOneRequiredWithoutInsightsNestedInput = {
    create?: XOR<SignalCreateWithoutInsightsInput, SignalUncheckedCreateWithoutInsightsInput>
    connectOrCreate?: SignalCreateOrConnectWithoutInsightsInput
    upsert?: SignalUpsertWithoutInsightsInput
    connect?: SignalWhereUniqueInput
    update?: XOR<XOR<SignalUpdateToOneWithWhereWithoutInsightsInput, SignalUpdateWithoutInsightsInput>, SignalUncheckedUpdateWithoutInsightsInput>
  }

  export type InsightOutcomeUpdateManyWithoutInsightNestedInput = {
    create?: XOR<InsightOutcomeCreateWithoutInsightInput, InsightOutcomeUncheckedCreateWithoutInsightInput> | InsightOutcomeCreateWithoutInsightInput[] | InsightOutcomeUncheckedCreateWithoutInsightInput[]
    connectOrCreate?: InsightOutcomeCreateOrConnectWithoutInsightInput | InsightOutcomeCreateOrConnectWithoutInsightInput[]
    upsert?: InsightOutcomeUpsertWithWhereUniqueWithoutInsightInput | InsightOutcomeUpsertWithWhereUniqueWithoutInsightInput[]
    createMany?: InsightOutcomeCreateManyInsightInputEnvelope
    set?: InsightOutcomeWhereUniqueInput | InsightOutcomeWhereUniqueInput[]
    disconnect?: InsightOutcomeWhereUniqueInput | InsightOutcomeWhereUniqueInput[]
    delete?: InsightOutcomeWhereUniqueInput | InsightOutcomeWhereUniqueInput[]
    connect?: InsightOutcomeWhereUniqueInput | InsightOutcomeWhereUniqueInput[]
    update?: InsightOutcomeUpdateWithWhereUniqueWithoutInsightInput | InsightOutcomeUpdateWithWhereUniqueWithoutInsightInput[]
    updateMany?: InsightOutcomeUpdateManyWithWhereWithoutInsightInput | InsightOutcomeUpdateManyWithWhereWithoutInsightInput[]
    deleteMany?: InsightOutcomeScalarWhereInput | InsightOutcomeScalarWhereInput[]
  }

  export type InsightOutcomeUncheckedUpdateManyWithoutInsightNestedInput = {
    create?: XOR<InsightOutcomeCreateWithoutInsightInput, InsightOutcomeUncheckedCreateWithoutInsightInput> | InsightOutcomeCreateWithoutInsightInput[] | InsightOutcomeUncheckedCreateWithoutInsightInput[]
    connectOrCreate?: InsightOutcomeCreateOrConnectWithoutInsightInput | InsightOutcomeCreateOrConnectWithoutInsightInput[]
    upsert?: InsightOutcomeUpsertWithWhereUniqueWithoutInsightInput | InsightOutcomeUpsertWithWhereUniqueWithoutInsightInput[]
    createMany?: InsightOutcomeCreateManyInsightInputEnvelope
    set?: InsightOutcomeWhereUniqueInput | InsightOutcomeWhereUniqueInput[]
    disconnect?: InsightOutcomeWhereUniqueInput | InsightOutcomeWhereUniqueInput[]
    delete?: InsightOutcomeWhereUniqueInput | InsightOutcomeWhereUniqueInput[]
    connect?: InsightOutcomeWhereUniqueInput | InsightOutcomeWhereUniqueInput[]
    update?: InsightOutcomeUpdateWithWhereUniqueWithoutInsightInput | InsightOutcomeUpdateWithWhereUniqueWithoutInsightInput[]
    updateMany?: InsightOutcomeUpdateManyWithWhereWithoutInsightInput | InsightOutcomeUpdateManyWithWhereWithoutInsightInput[]
    deleteMany?: InsightOutcomeScalarWhereInput | InsightOutcomeScalarWhereInput[]
  }

  export type SignalCreateNestedOneWithoutPendingActionsInput = {
    create?: XOR<SignalCreateWithoutPendingActionsInput, SignalUncheckedCreateWithoutPendingActionsInput>
    connectOrCreate?: SignalCreateOrConnectWithoutPendingActionsInput
    connect?: SignalWhereUniqueInput
  }

  export type EnumRiskLevelFieldUpdateOperationsInput = {
    set?: $Enums.RiskLevel
  }

  export type EnumActionClassFieldUpdateOperationsInput = {
    set?: $Enums.ActionClass
  }

  export type EnumActionStatusFieldUpdateOperationsInput = {
    set?: $Enums.ActionStatus
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type SignalUpdateOneRequiredWithoutPendingActionsNestedInput = {
    create?: XOR<SignalCreateWithoutPendingActionsInput, SignalUncheckedCreateWithoutPendingActionsInput>
    connectOrCreate?: SignalCreateOrConnectWithoutPendingActionsInput
    upsert?: SignalUpsertWithoutPendingActionsInput
    connect?: SignalWhereUniqueInput
    update?: XOR<XOR<SignalUpdateToOneWithWhereWithoutPendingActionsInput, SignalUpdateWithoutPendingActionsInput>, SignalUncheckedUpdateWithoutPendingActionsInput>
  }

  export type InsightCreateNestedOneWithoutOutcomesInput = {
    create?: XOR<InsightCreateWithoutOutcomesInput, InsightUncheckedCreateWithoutOutcomesInput>
    connectOrCreate?: InsightCreateOrConnectWithoutOutcomesInput
    connect?: InsightWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type InsightUpdateOneRequiredWithoutOutcomesNestedInput = {
    create?: XOR<InsightCreateWithoutOutcomesInput, InsightUncheckedCreateWithoutOutcomesInput>
    connectOrCreate?: InsightCreateOrConnectWithoutOutcomesInput
    upsert?: InsightUpsertWithoutOutcomesInput
    connect?: InsightWhereUniqueInput
    update?: XOR<XOR<InsightUpdateToOneWithWhereWithoutOutcomesInput, InsightUpdateWithoutOutcomesInput>, InsightUncheckedUpdateWithoutOutcomesInput>
  }

  export type SignalCreateNestedOneWithoutAuditLogsInput = {
    create?: XOR<SignalCreateWithoutAuditLogsInput, SignalUncheckedCreateWithoutAuditLogsInput>
    connectOrCreate?: SignalCreateOrConnectWithoutAuditLogsInput
    connect?: SignalWhereUniqueInput
  }

  export type SignalUpdateOneWithoutAuditLogsNestedInput = {
    create?: XOR<SignalCreateWithoutAuditLogsInput, SignalUncheckedCreateWithoutAuditLogsInput>
    connectOrCreate?: SignalCreateOrConnectWithoutAuditLogsInput
    upsert?: SignalUpsertWithoutAuditLogsInput
    disconnect?: SignalWhereInput | boolean
    delete?: SignalWhereInput | boolean
    connect?: SignalWhereUniqueInput
    update?: XOR<XOR<SignalUpdateToOneWithWhereWithoutAuditLogsInput, SignalUpdateWithoutAuditLogsInput>, SignalUncheckedUpdateWithoutAuditLogsInput>
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumEntityTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.EntityType | EnumEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.EntityType[] | ListEnumEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.EntityType[] | ListEnumEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumEntityTypeFilter<$PrismaModel> | $Enums.EntityType
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumEntityTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EntityType | EnumEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.EntityType[] | ListEnumEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.EntityType[] | ListEnumEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumEntityTypeWithAggregatesFilter<$PrismaModel> | $Enums.EntityType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEntityTypeFilter<$PrismaModel>
    _max?: NestedEnumEntityTypeFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumInsightSeverityFilter<$PrismaModel = never> = {
    equals?: $Enums.InsightSeverity | EnumInsightSeverityFieldRefInput<$PrismaModel>
    in?: $Enums.InsightSeverity[] | ListEnumInsightSeverityFieldRefInput<$PrismaModel>
    notIn?: $Enums.InsightSeverity[] | ListEnumInsightSeverityFieldRefInput<$PrismaModel>
    not?: NestedEnumInsightSeverityFilter<$PrismaModel> | $Enums.InsightSeverity
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumInsightSeverityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InsightSeverity | EnumInsightSeverityFieldRefInput<$PrismaModel>
    in?: $Enums.InsightSeverity[] | ListEnumInsightSeverityFieldRefInput<$PrismaModel>
    notIn?: $Enums.InsightSeverity[] | ListEnumInsightSeverityFieldRefInput<$PrismaModel>
    not?: NestedEnumInsightSeverityWithAggregatesFilter<$PrismaModel> | $Enums.InsightSeverity
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInsightSeverityFilter<$PrismaModel>
    _max?: NestedEnumInsightSeverityFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumRiskLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | EnumRiskLevelFieldRefInput<$PrismaModel>
    in?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskLevelFilter<$PrismaModel> | $Enums.RiskLevel
  }

  export type NestedEnumActionClassFilter<$PrismaModel = never> = {
    equals?: $Enums.ActionClass | EnumActionClassFieldRefInput<$PrismaModel>
    in?: $Enums.ActionClass[] | ListEnumActionClassFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActionClass[] | ListEnumActionClassFieldRefInput<$PrismaModel>
    not?: NestedEnumActionClassFilter<$PrismaModel> | $Enums.ActionClass
  }

  export type NestedEnumActionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ActionStatus | EnumActionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ActionStatus[] | ListEnumActionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActionStatus[] | ListEnumActionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumActionStatusFilter<$PrismaModel> | $Enums.ActionStatus
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumRiskLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | EnumRiskLevelFieldRefInput<$PrismaModel>
    in?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskLevelWithAggregatesFilter<$PrismaModel> | $Enums.RiskLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRiskLevelFilter<$PrismaModel>
    _max?: NestedEnumRiskLevelFilter<$PrismaModel>
  }

  export type NestedEnumActionClassWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActionClass | EnumActionClassFieldRefInput<$PrismaModel>
    in?: $Enums.ActionClass[] | ListEnumActionClassFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActionClass[] | ListEnumActionClassFieldRefInput<$PrismaModel>
    not?: NestedEnumActionClassWithAggregatesFilter<$PrismaModel> | $Enums.ActionClass
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumActionClassFilter<$PrismaModel>
    _max?: NestedEnumActionClassFilter<$PrismaModel>
  }

  export type NestedEnumActionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActionStatus | EnumActionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ActionStatus[] | ListEnumActionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActionStatus[] | ListEnumActionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumActionStatusWithAggregatesFilter<$PrismaModel> | $Enums.ActionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumActionStatusFilter<$PrismaModel>
    _max?: NestedEnumActionStatusFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type InsightCreateWithoutSignalInput = {
    id?: string
    severity: $Enums.InsightSeverity
    title: string
    what: string
    why: string
    evidence: JsonNullValueInput | InputJsonValue
    confidence: number
    agent: string
    createdAt?: Date | string
    dismissedAt?: Date | string | null
    snoozedUntil?: Date | string | null
    outcomes?: InsightOutcomeCreateNestedManyWithoutInsightInput
  }

  export type InsightUncheckedCreateWithoutSignalInput = {
    id?: string
    severity: $Enums.InsightSeverity
    title: string
    what: string
    why: string
    evidence: JsonNullValueInput | InputJsonValue
    confidence: number
    agent: string
    createdAt?: Date | string
    dismissedAt?: Date | string | null
    snoozedUntil?: Date | string | null
    outcomes?: InsightOutcomeUncheckedCreateNestedManyWithoutInsightInput
  }

  export type InsightCreateOrConnectWithoutSignalInput = {
    where: InsightWhereUniqueInput
    create: XOR<InsightCreateWithoutSignalInput, InsightUncheckedCreateWithoutSignalInput>
  }

  export type InsightCreateManySignalInputEnvelope = {
    data: InsightCreateManySignalInput | InsightCreateManySignalInput[]
    skipDuplicates?: boolean
  }

  export type PendingActionCreateWithoutSignalInput = {
    id?: string
    agent: string
    actionType: string
    actionPayload: JsonNullValueInput | InputJsonValue
    rationale: string
    expectedOutcome: string
    confidence: number
    riskLevel: $Enums.RiskLevel
    classification: $Enums.ActionClass
    status?: $Enums.ActionStatus
    guardrailRule?: string | null
    approvalToken?: string | null
    approvedBy?: string | null
    approvedAt?: Date | string | null
    rejectedReason?: string | null
    rejectedAt?: Date | string | null
    executedAt?: Date | string | null
    executionResult?: NullableJsonNullValueInput | InputJsonValue
    executionError?: string | null
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PendingActionUncheckedCreateWithoutSignalInput = {
    id?: string
    agent: string
    actionType: string
    actionPayload: JsonNullValueInput | InputJsonValue
    rationale: string
    expectedOutcome: string
    confidence: number
    riskLevel: $Enums.RiskLevel
    classification: $Enums.ActionClass
    status?: $Enums.ActionStatus
    guardrailRule?: string | null
    approvalToken?: string | null
    approvedBy?: string | null
    approvedAt?: Date | string | null
    rejectedReason?: string | null
    rejectedAt?: Date | string | null
    executedAt?: Date | string | null
    executionResult?: NullableJsonNullValueInput | InputJsonValue
    executionError?: string | null
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PendingActionCreateOrConnectWithoutSignalInput = {
    where: PendingActionWhereUniqueInput
    create: XOR<PendingActionCreateWithoutSignalInput, PendingActionUncheckedCreateWithoutSignalInput>
  }

  export type PendingActionCreateManySignalInputEnvelope = {
    data: PendingActionCreateManySignalInput | PendingActionCreateManySignalInput[]
    skipDuplicates?: boolean
  }

  export type AuditLogCreateWithoutSignalInput = {
    id?: string
    event: string
    actor: string
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogUncheckedCreateWithoutSignalInput = {
    id?: string
    event: string
    actor: string
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogCreateOrConnectWithoutSignalInput = {
    where: AuditLogWhereUniqueInput
    create: XOR<AuditLogCreateWithoutSignalInput, AuditLogUncheckedCreateWithoutSignalInput>
  }

  export type AuditLogCreateManySignalInputEnvelope = {
    data: AuditLogCreateManySignalInput | AuditLogCreateManySignalInput[]
    skipDuplicates?: boolean
  }

  export type InsightUpsertWithWhereUniqueWithoutSignalInput = {
    where: InsightWhereUniqueInput
    update: XOR<InsightUpdateWithoutSignalInput, InsightUncheckedUpdateWithoutSignalInput>
    create: XOR<InsightCreateWithoutSignalInput, InsightUncheckedCreateWithoutSignalInput>
  }

  export type InsightUpdateWithWhereUniqueWithoutSignalInput = {
    where: InsightWhereUniqueInput
    data: XOR<InsightUpdateWithoutSignalInput, InsightUncheckedUpdateWithoutSignalInput>
  }

  export type InsightUpdateManyWithWhereWithoutSignalInput = {
    where: InsightScalarWhereInput
    data: XOR<InsightUpdateManyMutationInput, InsightUncheckedUpdateManyWithoutSignalInput>
  }

  export type InsightScalarWhereInput = {
    AND?: InsightScalarWhereInput | InsightScalarWhereInput[]
    OR?: InsightScalarWhereInput[]
    NOT?: InsightScalarWhereInput | InsightScalarWhereInput[]
    id?: StringFilter<"Insight"> | string
    signalId?: StringFilter<"Insight"> | string
    severity?: EnumInsightSeverityFilter<"Insight"> | $Enums.InsightSeverity
    title?: StringFilter<"Insight"> | string
    what?: StringFilter<"Insight"> | string
    why?: StringFilter<"Insight"> | string
    evidence?: JsonFilter<"Insight">
    confidence?: FloatFilter<"Insight"> | number
    agent?: StringFilter<"Insight"> | string
    createdAt?: DateTimeFilter<"Insight"> | Date | string
    dismissedAt?: DateTimeNullableFilter<"Insight"> | Date | string | null
    snoozedUntil?: DateTimeNullableFilter<"Insight"> | Date | string | null
  }

  export type PendingActionUpsertWithWhereUniqueWithoutSignalInput = {
    where: PendingActionWhereUniqueInput
    update: XOR<PendingActionUpdateWithoutSignalInput, PendingActionUncheckedUpdateWithoutSignalInput>
    create: XOR<PendingActionCreateWithoutSignalInput, PendingActionUncheckedCreateWithoutSignalInput>
  }

  export type PendingActionUpdateWithWhereUniqueWithoutSignalInput = {
    where: PendingActionWhereUniqueInput
    data: XOR<PendingActionUpdateWithoutSignalInput, PendingActionUncheckedUpdateWithoutSignalInput>
  }

  export type PendingActionUpdateManyWithWhereWithoutSignalInput = {
    where: PendingActionScalarWhereInput
    data: XOR<PendingActionUpdateManyMutationInput, PendingActionUncheckedUpdateManyWithoutSignalInput>
  }

  export type PendingActionScalarWhereInput = {
    AND?: PendingActionScalarWhereInput | PendingActionScalarWhereInput[]
    OR?: PendingActionScalarWhereInput[]
    NOT?: PendingActionScalarWhereInput | PendingActionScalarWhereInput[]
    id?: StringFilter<"PendingAction"> | string
    signalId?: StringFilter<"PendingAction"> | string
    agent?: StringFilter<"PendingAction"> | string
    actionType?: StringFilter<"PendingAction"> | string
    actionPayload?: JsonFilter<"PendingAction">
    rationale?: StringFilter<"PendingAction"> | string
    expectedOutcome?: StringFilter<"PendingAction"> | string
    confidence?: FloatFilter<"PendingAction"> | number
    riskLevel?: EnumRiskLevelFilter<"PendingAction"> | $Enums.RiskLevel
    classification?: EnumActionClassFilter<"PendingAction"> | $Enums.ActionClass
    status?: EnumActionStatusFilter<"PendingAction"> | $Enums.ActionStatus
    guardrailRule?: StringNullableFilter<"PendingAction"> | string | null
    approvalToken?: StringNullableFilter<"PendingAction"> | string | null
    approvedBy?: StringNullableFilter<"PendingAction"> | string | null
    approvedAt?: DateTimeNullableFilter<"PendingAction"> | Date | string | null
    rejectedReason?: StringNullableFilter<"PendingAction"> | string | null
    rejectedAt?: DateTimeNullableFilter<"PendingAction"> | Date | string | null
    executedAt?: DateTimeNullableFilter<"PendingAction"> | Date | string | null
    executionResult?: JsonNullableFilter<"PendingAction">
    executionError?: StringNullableFilter<"PendingAction"> | string | null
    expiresAt?: DateTimeFilter<"PendingAction"> | Date | string
    createdAt?: DateTimeFilter<"PendingAction"> | Date | string
    updatedAt?: DateTimeFilter<"PendingAction"> | Date | string
  }

  export type AuditLogUpsertWithWhereUniqueWithoutSignalInput = {
    where: AuditLogWhereUniqueInput
    update: XOR<AuditLogUpdateWithoutSignalInput, AuditLogUncheckedUpdateWithoutSignalInput>
    create: XOR<AuditLogCreateWithoutSignalInput, AuditLogUncheckedCreateWithoutSignalInput>
  }

  export type AuditLogUpdateWithWhereUniqueWithoutSignalInput = {
    where: AuditLogWhereUniqueInput
    data: XOR<AuditLogUpdateWithoutSignalInput, AuditLogUncheckedUpdateWithoutSignalInput>
  }

  export type AuditLogUpdateManyWithWhereWithoutSignalInput = {
    where: AuditLogScalarWhereInput
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyWithoutSignalInput>
  }

  export type AuditLogScalarWhereInput = {
    AND?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
    OR?: AuditLogScalarWhereInput[]
    NOT?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
    id?: StringFilter<"AuditLog"> | string
    signalId?: StringNullableFilter<"AuditLog"> | string | null
    event?: StringFilter<"AuditLog"> | string
    actor?: StringFilter<"AuditLog"> | string
    payload?: JsonFilter<"AuditLog">
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
  }

  export type SignalCreateWithoutInsightsInput = {
    id?: string
    entityType: $Enums.EntityType
    entityId: string
    signalType: string
    contextSnapshot: JsonNullValueInput | InputJsonValue
    traceId: string
    firedAt?: Date | string
    pendingActions?: PendingActionCreateNestedManyWithoutSignalInput
    auditLogs?: AuditLogCreateNestedManyWithoutSignalInput
  }

  export type SignalUncheckedCreateWithoutInsightsInput = {
    id?: string
    entityType: $Enums.EntityType
    entityId: string
    signalType: string
    contextSnapshot: JsonNullValueInput | InputJsonValue
    traceId: string
    firedAt?: Date | string
    pendingActions?: PendingActionUncheckedCreateNestedManyWithoutSignalInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutSignalInput
  }

  export type SignalCreateOrConnectWithoutInsightsInput = {
    where: SignalWhereUniqueInput
    create: XOR<SignalCreateWithoutInsightsInput, SignalUncheckedCreateWithoutInsightsInput>
  }

  export type InsightOutcomeCreateWithoutInsightInput = {
    id?: string
    measuredAt: Date | string
    windowHours: number
    metricDeltas: JsonNullValueInput | InputJsonValue
    outcomeScore: number
    createdAt?: Date | string
  }

  export type InsightOutcomeUncheckedCreateWithoutInsightInput = {
    id?: string
    measuredAt: Date | string
    windowHours: number
    metricDeltas: JsonNullValueInput | InputJsonValue
    outcomeScore: number
    createdAt?: Date | string
  }

  export type InsightOutcomeCreateOrConnectWithoutInsightInput = {
    where: InsightOutcomeWhereUniqueInput
    create: XOR<InsightOutcomeCreateWithoutInsightInput, InsightOutcomeUncheckedCreateWithoutInsightInput>
  }

  export type InsightOutcomeCreateManyInsightInputEnvelope = {
    data: InsightOutcomeCreateManyInsightInput | InsightOutcomeCreateManyInsightInput[]
    skipDuplicates?: boolean
  }

  export type SignalUpsertWithoutInsightsInput = {
    update: XOR<SignalUpdateWithoutInsightsInput, SignalUncheckedUpdateWithoutInsightsInput>
    create: XOR<SignalCreateWithoutInsightsInput, SignalUncheckedCreateWithoutInsightsInput>
    where?: SignalWhereInput
  }

  export type SignalUpdateToOneWithWhereWithoutInsightsInput = {
    where?: SignalWhereInput
    data: XOR<SignalUpdateWithoutInsightsInput, SignalUncheckedUpdateWithoutInsightsInput>
  }

  export type SignalUpdateWithoutInsightsInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumEntityTypeFieldUpdateOperationsInput | $Enums.EntityType
    entityId?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    contextSnapshot?: JsonNullValueInput | InputJsonValue
    traceId?: StringFieldUpdateOperationsInput | string
    firedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pendingActions?: PendingActionUpdateManyWithoutSignalNestedInput
    auditLogs?: AuditLogUpdateManyWithoutSignalNestedInput
  }

  export type SignalUncheckedUpdateWithoutInsightsInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumEntityTypeFieldUpdateOperationsInput | $Enums.EntityType
    entityId?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    contextSnapshot?: JsonNullValueInput | InputJsonValue
    traceId?: StringFieldUpdateOperationsInput | string
    firedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pendingActions?: PendingActionUncheckedUpdateManyWithoutSignalNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutSignalNestedInput
  }

  export type InsightOutcomeUpsertWithWhereUniqueWithoutInsightInput = {
    where: InsightOutcomeWhereUniqueInput
    update: XOR<InsightOutcomeUpdateWithoutInsightInput, InsightOutcomeUncheckedUpdateWithoutInsightInput>
    create: XOR<InsightOutcomeCreateWithoutInsightInput, InsightOutcomeUncheckedCreateWithoutInsightInput>
  }

  export type InsightOutcomeUpdateWithWhereUniqueWithoutInsightInput = {
    where: InsightOutcomeWhereUniqueInput
    data: XOR<InsightOutcomeUpdateWithoutInsightInput, InsightOutcomeUncheckedUpdateWithoutInsightInput>
  }

  export type InsightOutcomeUpdateManyWithWhereWithoutInsightInput = {
    where: InsightOutcomeScalarWhereInput
    data: XOR<InsightOutcomeUpdateManyMutationInput, InsightOutcomeUncheckedUpdateManyWithoutInsightInput>
  }

  export type InsightOutcomeScalarWhereInput = {
    AND?: InsightOutcomeScalarWhereInput | InsightOutcomeScalarWhereInput[]
    OR?: InsightOutcomeScalarWhereInput[]
    NOT?: InsightOutcomeScalarWhereInput | InsightOutcomeScalarWhereInput[]
    id?: StringFilter<"InsightOutcome"> | string
    insightId?: StringFilter<"InsightOutcome"> | string
    measuredAt?: DateTimeFilter<"InsightOutcome"> | Date | string
    windowHours?: IntFilter<"InsightOutcome"> | number
    metricDeltas?: JsonFilter<"InsightOutcome">
    outcomeScore?: FloatFilter<"InsightOutcome"> | number
    createdAt?: DateTimeFilter<"InsightOutcome"> | Date | string
  }

  export type SignalCreateWithoutPendingActionsInput = {
    id?: string
    entityType: $Enums.EntityType
    entityId: string
    signalType: string
    contextSnapshot: JsonNullValueInput | InputJsonValue
    traceId: string
    firedAt?: Date | string
    insights?: InsightCreateNestedManyWithoutSignalInput
    auditLogs?: AuditLogCreateNestedManyWithoutSignalInput
  }

  export type SignalUncheckedCreateWithoutPendingActionsInput = {
    id?: string
    entityType: $Enums.EntityType
    entityId: string
    signalType: string
    contextSnapshot: JsonNullValueInput | InputJsonValue
    traceId: string
    firedAt?: Date | string
    insights?: InsightUncheckedCreateNestedManyWithoutSignalInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutSignalInput
  }

  export type SignalCreateOrConnectWithoutPendingActionsInput = {
    where: SignalWhereUniqueInput
    create: XOR<SignalCreateWithoutPendingActionsInput, SignalUncheckedCreateWithoutPendingActionsInput>
  }

  export type SignalUpsertWithoutPendingActionsInput = {
    update: XOR<SignalUpdateWithoutPendingActionsInput, SignalUncheckedUpdateWithoutPendingActionsInput>
    create: XOR<SignalCreateWithoutPendingActionsInput, SignalUncheckedCreateWithoutPendingActionsInput>
    where?: SignalWhereInput
  }

  export type SignalUpdateToOneWithWhereWithoutPendingActionsInput = {
    where?: SignalWhereInput
    data: XOR<SignalUpdateWithoutPendingActionsInput, SignalUncheckedUpdateWithoutPendingActionsInput>
  }

  export type SignalUpdateWithoutPendingActionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumEntityTypeFieldUpdateOperationsInput | $Enums.EntityType
    entityId?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    contextSnapshot?: JsonNullValueInput | InputJsonValue
    traceId?: StringFieldUpdateOperationsInput | string
    firedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    insights?: InsightUpdateManyWithoutSignalNestedInput
    auditLogs?: AuditLogUpdateManyWithoutSignalNestedInput
  }

  export type SignalUncheckedUpdateWithoutPendingActionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumEntityTypeFieldUpdateOperationsInput | $Enums.EntityType
    entityId?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    contextSnapshot?: JsonNullValueInput | InputJsonValue
    traceId?: StringFieldUpdateOperationsInput | string
    firedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    insights?: InsightUncheckedUpdateManyWithoutSignalNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutSignalNestedInput
  }

  export type InsightCreateWithoutOutcomesInput = {
    id?: string
    severity: $Enums.InsightSeverity
    title: string
    what: string
    why: string
    evidence: JsonNullValueInput | InputJsonValue
    confidence: number
    agent: string
    createdAt?: Date | string
    dismissedAt?: Date | string | null
    snoozedUntil?: Date | string | null
    signal: SignalCreateNestedOneWithoutInsightsInput
  }

  export type InsightUncheckedCreateWithoutOutcomesInput = {
    id?: string
    signalId: string
    severity: $Enums.InsightSeverity
    title: string
    what: string
    why: string
    evidence: JsonNullValueInput | InputJsonValue
    confidence: number
    agent: string
    createdAt?: Date | string
    dismissedAt?: Date | string | null
    snoozedUntil?: Date | string | null
  }

  export type InsightCreateOrConnectWithoutOutcomesInput = {
    where: InsightWhereUniqueInput
    create: XOR<InsightCreateWithoutOutcomesInput, InsightUncheckedCreateWithoutOutcomesInput>
  }

  export type InsightUpsertWithoutOutcomesInput = {
    update: XOR<InsightUpdateWithoutOutcomesInput, InsightUncheckedUpdateWithoutOutcomesInput>
    create: XOR<InsightCreateWithoutOutcomesInput, InsightUncheckedCreateWithoutOutcomesInput>
    where?: InsightWhereInput
  }

  export type InsightUpdateToOneWithWhereWithoutOutcomesInput = {
    where?: InsightWhereInput
    data: XOR<InsightUpdateWithoutOutcomesInput, InsightUncheckedUpdateWithoutOutcomesInput>
  }

  export type InsightUpdateWithoutOutcomesInput = {
    id?: StringFieldUpdateOperationsInput | string
    severity?: EnumInsightSeverityFieldUpdateOperationsInput | $Enums.InsightSeverity
    title?: StringFieldUpdateOperationsInput | string
    what?: StringFieldUpdateOperationsInput | string
    why?: StringFieldUpdateOperationsInput | string
    evidence?: JsonNullValueInput | InputJsonValue
    confidence?: FloatFieldUpdateOperationsInput | number
    agent?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dismissedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    snoozedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    signal?: SignalUpdateOneRequiredWithoutInsightsNestedInput
  }

  export type InsightUncheckedUpdateWithoutOutcomesInput = {
    id?: StringFieldUpdateOperationsInput | string
    signalId?: StringFieldUpdateOperationsInput | string
    severity?: EnumInsightSeverityFieldUpdateOperationsInput | $Enums.InsightSeverity
    title?: StringFieldUpdateOperationsInput | string
    what?: StringFieldUpdateOperationsInput | string
    why?: StringFieldUpdateOperationsInput | string
    evidence?: JsonNullValueInput | InputJsonValue
    confidence?: FloatFieldUpdateOperationsInput | number
    agent?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dismissedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    snoozedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SignalCreateWithoutAuditLogsInput = {
    id?: string
    entityType: $Enums.EntityType
    entityId: string
    signalType: string
    contextSnapshot: JsonNullValueInput | InputJsonValue
    traceId: string
    firedAt?: Date | string
    insights?: InsightCreateNestedManyWithoutSignalInput
    pendingActions?: PendingActionCreateNestedManyWithoutSignalInput
  }

  export type SignalUncheckedCreateWithoutAuditLogsInput = {
    id?: string
    entityType: $Enums.EntityType
    entityId: string
    signalType: string
    contextSnapshot: JsonNullValueInput | InputJsonValue
    traceId: string
    firedAt?: Date | string
    insights?: InsightUncheckedCreateNestedManyWithoutSignalInput
    pendingActions?: PendingActionUncheckedCreateNestedManyWithoutSignalInput
  }

  export type SignalCreateOrConnectWithoutAuditLogsInput = {
    where: SignalWhereUniqueInput
    create: XOR<SignalCreateWithoutAuditLogsInput, SignalUncheckedCreateWithoutAuditLogsInput>
  }

  export type SignalUpsertWithoutAuditLogsInput = {
    update: XOR<SignalUpdateWithoutAuditLogsInput, SignalUncheckedUpdateWithoutAuditLogsInput>
    create: XOR<SignalCreateWithoutAuditLogsInput, SignalUncheckedCreateWithoutAuditLogsInput>
    where?: SignalWhereInput
  }

  export type SignalUpdateToOneWithWhereWithoutAuditLogsInput = {
    where?: SignalWhereInput
    data: XOR<SignalUpdateWithoutAuditLogsInput, SignalUncheckedUpdateWithoutAuditLogsInput>
  }

  export type SignalUpdateWithoutAuditLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumEntityTypeFieldUpdateOperationsInput | $Enums.EntityType
    entityId?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    contextSnapshot?: JsonNullValueInput | InputJsonValue
    traceId?: StringFieldUpdateOperationsInput | string
    firedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    insights?: InsightUpdateManyWithoutSignalNestedInput
    pendingActions?: PendingActionUpdateManyWithoutSignalNestedInput
  }

  export type SignalUncheckedUpdateWithoutAuditLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumEntityTypeFieldUpdateOperationsInput | $Enums.EntityType
    entityId?: StringFieldUpdateOperationsInput | string
    signalType?: StringFieldUpdateOperationsInput | string
    contextSnapshot?: JsonNullValueInput | InputJsonValue
    traceId?: StringFieldUpdateOperationsInput | string
    firedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    insights?: InsightUncheckedUpdateManyWithoutSignalNestedInput
    pendingActions?: PendingActionUncheckedUpdateManyWithoutSignalNestedInput
  }

  export type InsightCreateManySignalInput = {
    id?: string
    severity: $Enums.InsightSeverity
    title: string
    what: string
    why: string
    evidence: JsonNullValueInput | InputJsonValue
    confidence: number
    agent: string
    createdAt?: Date | string
    dismissedAt?: Date | string | null
    snoozedUntil?: Date | string | null
  }

  export type PendingActionCreateManySignalInput = {
    id?: string
    agent: string
    actionType: string
    actionPayload: JsonNullValueInput | InputJsonValue
    rationale: string
    expectedOutcome: string
    confidence: number
    riskLevel: $Enums.RiskLevel
    classification: $Enums.ActionClass
    status?: $Enums.ActionStatus
    guardrailRule?: string | null
    approvalToken?: string | null
    approvedBy?: string | null
    approvedAt?: Date | string | null
    rejectedReason?: string | null
    rejectedAt?: Date | string | null
    executedAt?: Date | string | null
    executionResult?: NullableJsonNullValueInput | InputJsonValue
    executionError?: string | null
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AuditLogCreateManySignalInput = {
    id?: string
    event: string
    actor: string
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type InsightUpdateWithoutSignalInput = {
    id?: StringFieldUpdateOperationsInput | string
    severity?: EnumInsightSeverityFieldUpdateOperationsInput | $Enums.InsightSeverity
    title?: StringFieldUpdateOperationsInput | string
    what?: StringFieldUpdateOperationsInput | string
    why?: StringFieldUpdateOperationsInput | string
    evidence?: JsonNullValueInput | InputJsonValue
    confidence?: FloatFieldUpdateOperationsInput | number
    agent?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dismissedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    snoozedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    outcomes?: InsightOutcomeUpdateManyWithoutInsightNestedInput
  }

  export type InsightUncheckedUpdateWithoutSignalInput = {
    id?: StringFieldUpdateOperationsInput | string
    severity?: EnumInsightSeverityFieldUpdateOperationsInput | $Enums.InsightSeverity
    title?: StringFieldUpdateOperationsInput | string
    what?: StringFieldUpdateOperationsInput | string
    why?: StringFieldUpdateOperationsInput | string
    evidence?: JsonNullValueInput | InputJsonValue
    confidence?: FloatFieldUpdateOperationsInput | number
    agent?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dismissedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    snoozedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    outcomes?: InsightOutcomeUncheckedUpdateManyWithoutInsightNestedInput
  }

  export type InsightUncheckedUpdateManyWithoutSignalInput = {
    id?: StringFieldUpdateOperationsInput | string
    severity?: EnumInsightSeverityFieldUpdateOperationsInput | $Enums.InsightSeverity
    title?: StringFieldUpdateOperationsInput | string
    what?: StringFieldUpdateOperationsInput | string
    why?: StringFieldUpdateOperationsInput | string
    evidence?: JsonNullValueInput | InputJsonValue
    confidence?: FloatFieldUpdateOperationsInput | number
    agent?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dismissedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    snoozedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PendingActionUpdateWithoutSignalInput = {
    id?: StringFieldUpdateOperationsInput | string
    agent?: StringFieldUpdateOperationsInput | string
    actionType?: StringFieldUpdateOperationsInput | string
    actionPayload?: JsonNullValueInput | InputJsonValue
    rationale?: StringFieldUpdateOperationsInput | string
    expectedOutcome?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    classification?: EnumActionClassFieldUpdateOperationsInput | $Enums.ActionClass
    status?: EnumActionStatusFieldUpdateOperationsInput | $Enums.ActionStatus
    guardrailRule?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedReason?: NullableStringFieldUpdateOperationsInput | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    executedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    executionResult?: NullableJsonNullValueInput | InputJsonValue
    executionError?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PendingActionUncheckedUpdateWithoutSignalInput = {
    id?: StringFieldUpdateOperationsInput | string
    agent?: StringFieldUpdateOperationsInput | string
    actionType?: StringFieldUpdateOperationsInput | string
    actionPayload?: JsonNullValueInput | InputJsonValue
    rationale?: StringFieldUpdateOperationsInput | string
    expectedOutcome?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    classification?: EnumActionClassFieldUpdateOperationsInput | $Enums.ActionClass
    status?: EnumActionStatusFieldUpdateOperationsInput | $Enums.ActionStatus
    guardrailRule?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedReason?: NullableStringFieldUpdateOperationsInput | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    executedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    executionResult?: NullableJsonNullValueInput | InputJsonValue
    executionError?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PendingActionUncheckedUpdateManyWithoutSignalInput = {
    id?: StringFieldUpdateOperationsInput | string
    agent?: StringFieldUpdateOperationsInput | string
    actionType?: StringFieldUpdateOperationsInput | string
    actionPayload?: JsonNullValueInput | InputJsonValue
    rationale?: StringFieldUpdateOperationsInput | string
    expectedOutcome?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    classification?: EnumActionClassFieldUpdateOperationsInput | $Enums.ActionClass
    status?: EnumActionStatusFieldUpdateOperationsInput | $Enums.ActionStatus
    guardrailRule?: NullableStringFieldUpdateOperationsInput | string | null
    approvalToken?: NullableStringFieldUpdateOperationsInput | string | null
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedReason?: NullableStringFieldUpdateOperationsInput | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    executedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    executionResult?: NullableJsonNullValueInput | InputJsonValue
    executionError?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUpdateWithoutSignalInput = {
    id?: StringFieldUpdateOperationsInput | string
    event?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateWithoutSignalInput = {
    id?: StringFieldUpdateOperationsInput | string
    event?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyWithoutSignalInput = {
    id?: StringFieldUpdateOperationsInput | string
    event?: StringFieldUpdateOperationsInput | string
    actor?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InsightOutcomeCreateManyInsightInput = {
    id?: string
    measuredAt: Date | string
    windowHours: number
    metricDeltas: JsonNullValueInput | InputJsonValue
    outcomeScore: number
    createdAt?: Date | string
  }

  export type InsightOutcomeUpdateWithoutInsightInput = {
    id?: StringFieldUpdateOperationsInput | string
    measuredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    windowHours?: IntFieldUpdateOperationsInput | number
    metricDeltas?: JsonNullValueInput | InputJsonValue
    outcomeScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InsightOutcomeUncheckedUpdateWithoutInsightInput = {
    id?: StringFieldUpdateOperationsInput | string
    measuredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    windowHours?: IntFieldUpdateOperationsInput | number
    metricDeltas?: JsonNullValueInput | InputJsonValue
    outcomeScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InsightOutcomeUncheckedUpdateManyWithoutInsightInput = {
    id?: StringFieldUpdateOperationsInput | string
    measuredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    windowHours?: IntFieldUpdateOperationsInput | number
    metricDeltas?: JsonNullValueInput | InputJsonValue
    outcomeScore?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use SignalCountOutputTypeDefaultArgs instead
     */
    export type SignalCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SignalCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InsightCountOutputTypeDefaultArgs instead
     */
    export type InsightCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InsightCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SignalDefaultArgs instead
     */
    export type SignalArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SignalDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InsightDefaultArgs instead
     */
    export type InsightArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InsightDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PendingActionDefaultArgs instead
     */
    export type PendingActionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PendingActionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InsightOutcomeDefaultArgs instead
     */
    export type InsightOutcomeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InsightOutcomeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AuditLogDefaultArgs instead
     */
    export type AuditLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AuditLogDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AgentConfigDefaultArgs instead
     */
    export type AgentConfigArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AgentConfigDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}