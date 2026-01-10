-- ================================================
-- mirAIcafe ポリシー完全更新SQL（最終版）
-- 更新日: 2026年1月10日
-- 
-- 更新内容:
-- 1. 特定商取引法: 販売事業者名、所在地（バーチャルオフィス住所追加）、連絡先
-- 2. キャンセルポリシー: 個別相談サービスの詳細追加、月額払い削除
-- 3. 利用規約: 秘密保持（守秘義務）条項追加、個別相談の範囲明記、
--              反社会的勢力の排除、録音・録画禁止の明確化、月額払い削除
-- ================================================

-- ================================================
-- 1. 特定商取引法に基づく表記更新
-- ================================================
UPDATE policies SET 
  content = '<div class="space-y-8">

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">販売事業者名</h2>
<p class="text-gray-700 leading-relaxed">田端　洋子</p>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">屋号</h2>
<p class="text-gray-700 leading-relaxed">mion careery</p>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">運営サイト名</h2>
<p class="text-gray-700 leading-relaxed">mirAIcafe（ミライカフェ）</p>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">運営責任者</h2>
<p class="text-gray-700 leading-relaxed">田端　洋子</p>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">所在地</h2>
<p class="text-gray-700 leading-relaxed">〒542-0081<br>大阪府大阪市中央区南船場3丁目2番22号 おおきに南船場ビル205</p>
<p class="text-sm text-gray-500 mt-2">※郵送でのお問い合わせは到着・回答までにお時間をいただく場合がございます。お問い合わせはメールまたはフォームをご利用ください。</p>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">電話番号</h2>
<p class="text-gray-700 leading-relaxed">請求があった場合に、遅滞なく開示いたします。</p>
<p class="text-sm text-gray-500 mt-2">※お問い合わせは原則として下記メールアドレスまたはお問い合わせフォームをご利用ください。</p>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">メールアドレス</h2>
<p class="text-gray-700 leading-relaxed">ai.career@miraicafe.work</p>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">お問い合わせフォーム</h2>
<p class="text-gray-700 leading-relaxed"><a href="/contact" class="text-pink-600 hover:text-pink-700 underline">https://miraicafe.work/contact</a></p>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">販売価格</h2>
<p class="text-gray-700 leading-relaxed">各講座・各サービスの販売ページに記載された価格（税込）</p>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">商品代金以外の必要料金</h2>
<p class="text-gray-700 leading-relaxed">インターネット接続に必要な通信費等は利用者の負担となります。</p>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">お支払い方法</h2>
<p class="text-gray-700 leading-relaxed mb-4"><strong>クレジットカード決済（Stripe）</strong><br>VISA、Mastercard、American Express<br><span class="text-sm text-gray-500">※JCB、Diners Club、Discoverは現在ご利用いただけません。</span></p>
<p class="text-gray-700 leading-relaxed mb-3">コースサービスについては、以下の支払方法を選択できます。</p>
<ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
<li><strong>一括払い</strong>：申込時に全額を決済</li>
<li><strong>1回ごとの参加</strong>：各回ごとに決済</li>
</ul>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">お支払い時期</h2>
<p class="text-gray-700 leading-relaxed">お申し込み時に決済が確定します。</p>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">商品の引渡し時期（サービス提供時期）</h2>
<p class="text-gray-700 leading-relaxed">決済完了後、メールにて受講方法・利用方法をご案内いたします。</p>
<p class="text-sm text-gray-500 mt-2">（各サービスの提供時期は販売ページに別途表示する場合があります。）</p>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">返品・キャンセルについて</h2>
<div class="space-y-4 text-gray-700 leading-relaxed">
<p>当所が提供するオンライン講座、教材、その他デジタルコンテンツについては、サービスの性質上、申込および決済完了後の返品・返金には原則として応じておりません。</p>
<p>コースサービスについても同様に、決済完了後の返金には原則として応じておりません。</p>
<p>利用者都合によるキャンセルについても返金の対象外となります。</p>
<p>ただし、個別日程が設定されたサービスについては、開催日の3日前までにお問い合わせフォームより連絡があった場合に限り、当所の判断で、原則1回を上限として日程変更に応じることがあります。</p>
<p>（詳細は「<a href="/cancellation-policy" class="text-pink-600 hover:text-pink-700 underline">キャンセル・返金ポリシー</a>」をご確認ください。）</p>
</div>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">サービス提供の中止</h2>
<p class="text-gray-700 leading-relaxed">当所の都合によりやむを得ずサービス提供を中止する場合があります。未提供分があるときは、当所の判断により返金または代替対応を行う場合があります。</p>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">表現および商品に関する注意書き</h2>
<p class="text-gray-700 leading-relaxed">本サービスおよび講座内容は、受講者の知識・スキル向上を目的としたものであり、特定の成果、効果、正確性、将来の結果を保証するものではありません。</p>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">個人情報の取扱い</h2>
<p class="text-gray-700 leading-relaxed">利用者の個人情報は、当所のプライバシーポリシーに基づき適切に管理いたします。</p>
</section>

<p class="mt-12 text-sm text-gray-500 text-right">最終更新日: 2026年1月10日</p>

</div>',
  last_updated = '2026-01-10'
WHERE id = 'tokushoho';

-- ================================================
-- 2. キャンセルポリシー更新
-- ================================================
UPDATE policies SET 
  content = '<div class="space-y-8">

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">1. 返金について（原則返金不可）</h2>
<p class="text-gray-700 leading-relaxed">当所が提供する有料サービスは、デジタルコンテンツおよびオンラインサービスの性質上、申込および決済完了後の返金には原則として応じておりません。</p>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">2. 利用者都合によるキャンセル（返金対象外）</h2>
<p class="text-gray-700 leading-relaxed">利用者都合によるキャンセル（例：体調不良、都合変更、期待との相違、理解不足、通信環境・端末環境の不具合、操作方法不明、家族・職場の事情等を含みますがこれらに限りません。）については、理由の如何を問わず返金の対象外となります。</p>

<h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">2-2. コース申込（複数回セット）の取扱い</h3>

<h4 class="font-semibold text-gray-700 mt-4 mb-2">(1) 一括払いの場合</h4>
<p class="text-gray-700 leading-relaxed">コース一括払いでお申込みいただいた場合、決済完了時点で全回分の受講権が確定し、途中での解約・返金には原則として応じません。やむを得ず一部の回に参加できない場合でも、不参加分の返金・繰越はいたしません。</p>

<h4 class="font-semibold text-gray-700 mt-4 mb-2">(2) 1回ごとの参加からコースへの切替</h4>
<p class="text-gray-700 leading-relaxed">1回ごとの参加でお支払いいただいた料金は、コース料金への充当・差額精算には応じておりません。コースへの切替をご希望の場合は、別途コース料金の全額をお支払いいただきます。</p>

<h4 class="font-semibold text-gray-700 mt-4 mb-2">(3) 早期申込割引について</h4>
<p class="text-gray-700 leading-relaxed">早期申込割引は、コース開始日の3週間前までにお申込みいただいた場合に適用されます。期限経過後の割引適用には応じておりません。</p>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">3. 日程変更について</h2>
<div class="space-y-4 text-gray-700 leading-relaxed">
<p>個別日程が設定された講座・セッション・個別相談サービス等（以下「個別日程型サービス」といいます。）については、開催日の3日前までに、当所所定の方法（原則としてお問い合わせフォーム）により日程変更の申出があった場合に限り、当所の判断で日程変更に応じることがあります。</p>
<p>日程変更は、原則として1回までとします。</p>
<p>以下の場合、日程変更には応じません。</p>
<ul class="list-disc list-inside space-y-2 ml-4">
<li><strong>開催日の2日前〜当日の連絡</strong></li>
<li>無断欠席</li>
<li>2回目以降の変更希望</li>
<li>当所が合理的理由により日程変更が困難と判断した場合</li>
</ul>
<p>日程変更は、返金を保証するものではなく、また返金請求権を発生させるものではありません。</p>
<p>個別日程型サービス以外（オンデマンド教材、即時提供コンテンツ等）の性質上、日程変更の概念がないものについては、本条は適用されません。</p>
</div>

<h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">3-1. 個別相談サービスの予約フロー</h3>
<div class="space-y-4 text-gray-700 leading-relaxed">
<p>個別相談サービス（AI活用相談、キャリア・メンタル相談等）は承認制です。</p>
<p><strong>予約の流れ:</strong></p>
<ol class="list-decimal list-inside space-y-2 ml-4">
<li>予約申請の送信</li>
<li>当所による内容確認・承認（通常1〜2営業日以内）</li>
<li>承認後、決済用URLをメールで送付</li>
<li>決済完了で予約確定（Google Meet参加URLを送付）</li>
</ol>
<p class="mt-4"><strong>決済期限:</strong> 予約日の前日23:59まで</p>
<p class="text-sm text-gray-500">※決済期限を過ぎると、決済リンクは無効となり、予約は自動的にキャンセルされます（料金は発生しません）。</p>
</div>

<h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">3-2. 個別相談サービスのキャンセル・日程変更</h3>
<div class="space-y-4 text-gray-700 leading-relaxed">
<p><strong>決済前のキャンセル:</strong></p>
<ul class="list-disc list-inside space-y-2 ml-4">
<li>決済期限（予約日の前日23:59）までに決済しなかった場合、予約は自動的にキャンセルされます（料金は発生しません）</li>
</ul>
<p class="mt-4"><strong>決済後のキャンセル・日程変更:</strong></p>
<ul class="list-disc list-inside space-y-2 ml-4">
<li><strong>予約日の3日前まで:</strong> 別日程への振替に応じます（1回限り）</li>
<li><strong>予約日の2日前〜前日:</strong> 振替不可（受講権消滅）</li>
<li><strong>予約当日・無断欠席:</strong> 振替不可（受講権消滅）</li>
</ul>
<p class="text-sm text-gray-500 mt-3">※いずれの場合も返金には応じません。</p>
</div>

<h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">3-3. 個別相談の技術的トラブル</h3>
<p class="text-gray-700 leading-relaxed">個別相談はGoogle Meetを使用したオンライン形式で実施します。通信環境や端末の不具合等、利用者側の技術的問題により相談に参加できなかった場合、当所は責任を負いかねます。事前に通信環境のご確認をお願いいたします。</p>

<h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">3-4. コースサービスにおける欠席の取扱い</h3>
<p class="text-gray-700 leading-relaxed">コースサービスにおいて特定の回に参加できない場合、前項（第3条）の日程変更の定めに従い対応いたします。日程変更が認められない場合、当該回の受講権は消滅し、返金、振替、アーカイブ配信、資料提供等の代替対応は原則として行いません。</p>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">4. 当所都合による中止・提供不能</h2>
<div class="space-y-4 text-gray-700 leading-relaxed">
<p>当所の都合により、やむを得ずサービス提供が不可能となった場合（例：当所の重大な事情、提供基盤の重大障害等）には、未提供分があるときに限り、当所の判断で返金または代替対応を行う場合があります。</p>
<p>コースサービス提供中に当所都合により継続が不可能となった場合、未提供回数分に相当する金額を按分計算のうえ、返金または代替対応を行う場合があります。按分計算は、お支払いいただいたコース価格（早期割引適用の場合はその価格）を基準とします。</p>
<p>天災、停電、通信障害、外部サービスの障害、その他当所の合理的支配を超える事由により提供が困難となった場合には、当所は代替日程の提示等、合理的な範囲で対応するよう努めます。</p>
</div>
</section>

<section class="mb-8">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">5. 法令に基づく対応</h2>
<p class="text-gray-700 leading-relaxed">本ポリシーは、消費者契約法その他の法令により返金等の対応が義務付けられる場合には、その範囲において適用されないことがあります。</p>
</section>

<p class="mt-12 text-sm text-gray-500 text-right">最終更新日: 2026年1月10日</p>

</div>',
  last_updated = '2026-01-10'
WHERE id = 'cancellation';

-- ================================================
-- 3. 利用規約更新（秘密保持条項追加、個別相談の範囲明記）
-- ================================================
UPDATE policies SET 
  content = '<div class="space-y-6">

<p class="text-gray-700 leading-relaxed">本利用規約（以下「本規約」といいます。）は、mion careery（個人事業主、以下「当所」といいます。）が運営するウェブサイト「mirAIcafe」（以下「本サイト」といいます。）および本サイトを通じて提供される各種サービス（以下総称して「本サービス」といいます。）の利用条件を定めるものです。</p>

<p class="text-gray-700 leading-relaxed">利用者は、本規約に同意のうえ、本サービスを利用するものとします。</p>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第1条（適用）</h2>
<div class="space-y-3 text-gray-700 leading-relaxed">
<p>本規約は、本サービスの利用に関する当所と利用者との間の一切の関係に適用されます。</p>
<p>当所が本サイト上で掲載する個別規定、注意事項、ガイドライン、キャンセル・返金ポリシー、特定商取引法に基づく表記、その他の定め（以下「個別規定等」といいます。）は、本規約の一部を構成するものとします。</p>
<p>本規約と個別規定等の内容が矛盾抵触する場合は、当該個別規定等が優先して適用されるものとします。</p>
</div>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第2条（定義）</h2>
<p class="text-gray-700 leading-relaxed mb-3">本規約において、次の各号に定める用語は、各号に定める意味を有します。</p>
<ul class="list-none space-y-3 text-gray-700 leading-relaxed">
<li><strong>(1)「利用者」</strong>とは、本サービスを閲覧、利用、申込み、購入その他一切の方法により利用する者をいいます。</li>
<li><strong>(2)「有料サービス」</strong>とは、本サービスのうち、対価の支払いを条件として提供されるオンライン講座、教材、コンテンツ、セッションその他一切のサービスをいいます。</li>
<li><strong>(3)「コースサービス」</strong>とは、有料サービスのうち、複数回で構成されるコース形式のサービスをいいます。</li>
<li><strong>(4)「個別相談サービス」</strong>とは、有料サービスのうち、AI活用相談、キャリア相談、メンタル相談等、利用者と当所が1対1で行うオンライン相談セッションをいいます。</li>
<li><strong>(5)「コンテンツ」</strong>とは、文章、画像、動画、音声、教材、資料、プログラム、システム、出力結果、その他本サイトまたは本サービス上で提供される情報一切をいいます。</li>
<li><strong>(6)「外部サービス」</strong>とは、当所が本サービスの提供に関連して利用する第三者のサービス（決済、配信、解析、AI関連、クラウド等を含みますがこれに限りません。）をいいます。</li>
<li><strong>(7)「秘密情報」</strong>とは、本サービスの利用に関連して、利用者または当所が相手方に開示した非公知の情報をいいます。</li>
</ul>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第3条（サービス内容）</h2>
<p class="text-gray-700 leading-relaxed mb-3">本サービスは、以下の内容を含みますが、これらに限られません。</p>
<ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
<li>AIに関するニュース、記事、情報の紹介および解説</li>
<li>当所または運営責任者（mion／ミオン）等の知識・経験に基づくAI関連情報の提供</li>
<li>当所または運営者が作成・開発した成果物、システム、ツール等のポートフォリオの公開</li>
<li>AIに関するオンライン講座、教材、関連コンテンツの紹介および提供</li>
<li>個別相談サービス（AI活用相談、キャリア・メンタル相談等）</li>
<li>音声認識、チャットボット、コンテンツ生成等のAI技術を用いた機能</li>
<li>前各号に付随する申込み、決済、問い合わせ対応等の機能</li>
</ul>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第3条の2（個別相談サービスの範囲・免責）</h2>
<div class="space-y-3 text-gray-700 leading-relaxed">
<p>個別相談サービスは、AI活用、キャリア、メンタルに関する一般的な情報提供およびアドバイスを目的とするものであり、以下のような専門的サービスには該当しません。</p>
<ul class="list-disc list-inside space-y-2 ml-4">
<li>医療行為、医療的診断、治療（医師法、精神保健福祉法等に基づくもの）</li>
<li>法律相談、法的助言（弁護士法に基づくもの）</li>
<li>財務・税務相談、投資助言（税理士法、金融商品取引法等に基づくもの）</li>
<li>その他法令上の資格を要する専門的サービス</li>
</ul>
<p>利用者は、個別相談サービスにおいて提供される情報が、上記専門サービスの代替とはならないことを理解し、必要に応じて各分野の専門家に相談するものとします。</p>
<p>当所は、個別相談サービスにおいて利用者に提供した情報・アドバイスに基づき利用者が行った判断・行動の結果について、当所の故意または重過失による場合を除き、責任を負いません。</p>
</div>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第4条（情報提供の位置づけ・非保証）</h2>
<div class="space-y-3 text-gray-700 leading-relaxed">
<p>本サービスにおいて提供される情報、講座内容、教材、解説等は、一般的な情報提供および学習支援を目的とするものであり、特定の成果、効果、正確性、完全性、適法性、最新性、特定目的への適合性、将来の結果等を保証するものではありません。</p>
<p>AI技術、法令、業界動向等は変化が早く、本サービス上の情報が常に最新であることを当所は保証しません。</p>
<p>利用者は、自身の判断と責任において本サービスを利用するものとします。</p>
</div>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第5条（第三者情報・外部コンテンツ）</h2>
<div class="space-y-3 text-gray-700 leading-relaxed">
<p>本サイトでは、第三者が提供するニュース、記事、情報、外部サイトへのリンク等を掲載する場合があります。</p>
<p>当所は、第三者の情報・コンテンツについて、その正確性、合法性、権利関係、内容の完全性等を保証しません。</p>
<p>利用者が外部サイトまたは外部サービスを利用する場合は、利用者自身の責任において行うものとし、当所は当該利用により利用者に生じた損害について責任を負いません。</p>
</div>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第6条（AI技術の利用）</h2>
<div class="space-y-3 text-gray-700 leading-relaxed">
<p>当所は、本サービスの利便性および効率化のため、音声認識、チャットボット、コンテンツ生成等のAI技術を利用する場合があります。</p>
<p>AI技術による出力結果には、誤認識、誤生成、不完全な情報、意図しない表現等が含まれる可能性があります。</p>
<p>利用者は、AIによる出力結果を含む本サービス上の情報について、最終的な判断を自身の責任で行うものとします。</p>
</div>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第7条（入力情報・学習データの取扱い）</h2>
<div class="space-y-3 text-gray-700 leading-relaxed">
<p>利用者が本サービス上で入力、送信または提供した情報（音声入力、テキスト入力、問い合わせ内容等を含みます。以下「入力情報」といいます。）について、当所は、当所が提供または管理するAIモデルの学習目的で利用することはありません。</p>
<p>ただし、当所は、本サービスの提供、運営、保守、品質向上、不具合対応、不正利用防止等に必要な範囲で、外部サービスまたはシステムを利用し、入力情報を取り扱う場合があります。</p>
<p>当所は、合理的な安全管理措置を講じるよう努めますが、通信環境、端末環境、外部サービスの障害、第三者による不正行為等、当所の管理外の事由により生じた損害について責任を負いません。</p>
</div>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第7条の2（秘密保持）</h2>
<div class="space-y-3 text-gray-700 leading-relaxed">
<p>当所および利用者は、本サービスの利用に関連して相手方から開示を受けた秘密情報を、本サービスの目的以外に使用せず、第三者に開示・漏洩しないものとします。</p>
<p>ただし、以下に該当する情報は秘密情報に含まないものとします。</p>
<ul class="list-disc list-inside space-y-2 ml-4">
<li>開示を受けた時点で既に公知であった情報</li>
<li>開示を受けた後、自己の責によらず公知となった情報</li>
<li>開示を受ける前から正当に保有していた情報</li>
<li>正当な権限を有する第三者から秘密保持義務を負うことなく取得した情報</li>
<li>法令または裁判所その他の公的機関の命令により開示が義務付けられた情報</li>
</ul>
<p>本条に定める秘密保持義務は、本サービスの利用終了後も継続して効力を有するものとします。</p>
<p>当所は、個別相談サービスにおいて利用者から開示された相談内容について、利用者のプライバシーに配慮し、適切に管理いたします。ただし、法令上の義務がある場合、または生命・身体・財産の保護のために緊急に必要がある場合には、関係機関等に情報を開示することがあります。</p>
</div>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第8条（知的財産権）</h2>
<div class="space-y-3 text-gray-700 leading-relaxed">
<p>本サイトおよび本サービスに関するコンテンツの著作権、商標権、ノウハウ、その他一切の知的財産権は、当所または正当な権利者に帰属します。</p>
<p>利用者は、私的利用の範囲を超えて、当所の事前の承諾なく、コンテンツを複製、転載、改変、翻案、再配布、公衆送信、販売、転売、共有、公開等してはなりません。</p>
<p>有料サービスの購入または受講後であっても、コンテンツに関する権利は利用者に移転しません。</p>
</div>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第9条（禁止事項）</h2>
<p class="text-gray-700 leading-relaxed mb-3">利用者は、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
<ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
<li>法令または公序良俗に違反する行為</li>
<li>当所または第三者の知的財産権、名誉、信用、プライバシー等を侵害する行為</li>
<li>本サービスの運営を妨害する行為、または妨害するおそれのある行為</li>
<li>不正アクセス、過度な負荷を生じさせる行為、プログラム等を用いた不正な操作</li>
<li>有料サービスのコンテンツ、教材、資料等の第三者への共有、転載、転売、再配布、スクリーンショット等による公開</li>
<li>コースサービスまたは個別相談において、他の参加者の映像、音声、発言内容等を当所の承諾なく録画、録音、撮影、公開、共有する行為</li>
<li>個別相談サービスにおいて、当所の承諾なく、相談内容を録画、録音、撮影する行為</li>
<li>反社会的勢力等（暴力団、暴力団員、暴力団準構成員、暴力団関係企業、総会屋、社会運動標榜ゴロ、政治活動標榜ゴロ、特殊知能暴力集団等、またはこれらに準ずる者をいいます。）に該当すること、またはこれらとの関係を有すること</li>
<li>反社会的勢力への利益供与、またはこれに準ずる行為</li>
<li>その他、当所が不適切と判断する行為</li>
</ul>
<p class="text-gray-700 leading-relaxed mt-4">当所は、利用者が前項の禁止事項に違反した場合、または違反するおそれがあると判断した場合には、事前通知なく、本サービスの利用停止、有料サービスの提供中止、アカウントの抹消等の措置を講じることができるものとし、これにより利用者に生じた損害について責任を負いません。また、当所は、利用者の違反行為により損害を被った場合には、当該利用者に対し損害賠償を請求することができるものとします。</p>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第10条（有料サービス・申込み・決済）</h2>
<div class="space-y-3 text-gray-700 leading-relaxed">
<p>有料サービスの内容、価格、支払方法、提供条件、提供時期等は、本サイト上の各サービスページ、または特定商取引法に基づく表記により表示します。</p>
<p>利用者が申込みを行い決済が完了した時点で、当所と利用者との間に当該有料サービスに関する契約が成立するものとします。</p>
<p>キャンセル、返金、日程変更等に関する条件は、当所が別途定めるキャンセル・返金ポリシーに従うものとします。</p>
</div>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第10条の2（コースサービスの支払方法）</h2>
<ol class="list-decimal list-inside space-y-3 text-gray-700 leading-relaxed ml-4">
<li>コースサービスについては、一括払いまたは1回ごとの参加のいずれかの方法で申込むことができます。各支払方法の詳細および価格は、サービスページに表示します。</li>
<li>一括払いでお申込みいただいた場合、申込時に全額を決済いただきます。</li>
<li>1回ごとの参加の場合、各回ごとに決済いただきます。1回ごとの参加で支払った料金は、コース料金への充当には応じておりません。</li>
<li>早期申込割引その他の割引は、コース開始日の3週間前までにお申込みいただいた場合に限り適用されます。期限経過後の割引適用には応じておりません。</li>
</ol>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第10条の3（個別相談サービスの申込み・承認）</h2>
<div class="space-y-3 text-gray-700 leading-relaxed">
<p>個別相談サービスは、承認制とします。利用者が予約申請を行い、当所が承認した場合に予約が成立します。</p>
<p>当所は、予約申請の内容、相談内容、利用者の過去の利用状況等を考慮し、承認の可否を判断します。当所は、承認を拒否する場合であっても、その理由を開示する義務を負いません。</p>
<p>承認後、当所は利用者に対し決済用URLを送付します。利用者が決済期限（予約日の前日23:59）までに決済を完了しない場合、予約は自動的にキャンセルされます。</p>
<p>決済完了後、当所は利用者に対しGoogle Meet参加URLを送付します。</p>
</div>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第11条（キャンセル・返金・日程変更）</h2>
<p class="text-gray-700 leading-relaxed">キャンセル、返金、日程変更に関する取扱い（コースサービスにおける一括払い、1回ごとの参加の取扱いを含みます。）は、キャンセル・返金ポリシーに従うものとし、本規約とキャンセル・返金ポリシーの内容が矛盾抵触する場合にはキャンセル・返金ポリシーが優先して適用されます。</p>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第12条（サービスの変更・中断・終了）</h2>
<div class="space-y-3 text-gray-700 leading-relaxed">
<p>当所は、利用者への事前通知なく、本サービスの全部または一部の内容変更、提供条件の変更、提供の中断または終了を行うことがあります。</p>
<p>当所は、前項により利用者に損害が生じた場合であっても、当所の故意または重過失による場合を除き、責任を負いません。</p>
</div>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第13条（免責・損害賠償責任の制限）</h2>
<div class="space-y-3 text-gray-700 leading-relaxed">
<p>当所は、当所の故意または重過失による場合を除き、本サービスに関連して利用者に生じた損害について責任を負いません。</p>
<p>消費者契約法その他の法令により免責が制限される場合には、当所は、当該有料サービスに関して利用者が当所に支払った対価の総額を上限として、責任を負うものとします。</p>
<p>当所は、間接損害、特別損害、逸失利益、データの消失、事業機会の損失等については、当所の故意または重過失による場合を除き、責任を負いません。</p>
</div>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第14条（利用対象・法人利用）</h2>
<div class="space-y-3 text-gray-700 leading-relaxed">
<p>本サービスは主として個人を対象として提供されます。</p>
<p>法人、団体または事業目的で利用する場合には、当所が別途定める条件が適用されることがあります。</p>
</div>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第15条（未成年者の利用）</h2>
<p class="text-gray-700 leading-relaxed">未成年者が本サービスを利用する場合には、事前に親権者その他の法定代理人の同意を得るものとします。</p>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第16条（規約の変更）</h2>
<p class="text-gray-700 leading-relaxed">当所は、必要に応じて本規約を変更できるものとします。変更後の本規約は、本サイトに掲載した時点で効力を生じるものとします。</p>
</section>

<section class="mb-6">
<h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-200">第17条（準拠法・管轄）</h2>
<div class="space-y-3 text-gray-700 leading-relaxed">
<p>本規約は、日本法を準拠法とします。</p>
<p>本サービスに関して当所と利用者との間で生じた紛争については、大阪地方裁判所または大阪簡易裁判所を第一審の専属的合意管轄裁判所とします。</p>
<p class="text-sm text-gray-500">※なお、消費者契約法その他の法令により専属的合意管轄が制限される場合には、その限度で適用されます。</p>
</div>
</section>

<p class="mt-12 text-sm text-gray-500 text-right">最終更新日: 2026年1月10日</p>

</div>',
  last_updated = '2026-01-10'
WHERE id = 'terms';
